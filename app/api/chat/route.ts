import type { NextRequest } from "next/server";
import { addMessage } from "@/lib/chat-service";

export const runtime = "nodejs";
// export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      messages,
      message, // For compatibility with older clients
      systemPrompt = "",
      chatId,
      userId,
      model = "DeepSeek-V3",
      temperature = 0.7,
      maxTokens = 2048,
      topP = 0.95,
      attachments = [],
    } = body;

    // Check for required fields with more detailed error response
    const missingFields: string[] = []; // Specify the type as string[]
    if (!messages && !message) missingFields.push("messages");
    if (!chatId) missingFields.push("chatId");
    if (!userId) missingFields.push("userId");

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          error: `Missing required fields: ${missingFields.join(", ")} are required`,
          received: Object.keys(body).join(", "),
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Normalize messages format
    const normalizedMessages =
      messages || (message ? [{ role: "user", content: message }] : []);

    // Get the latest user message
    const userMessage = normalizedMessages.find(
      (msg: any) => msg.role === "user",
    );
    if (!userMessage && normalizedMessages.length > 0) {
      return new Response(
        JSON.stringify({
          error: "No user message found in the messages array",
          messages: normalizedMessages,
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Add user message to Firestore if it's a new message
    // We're assuming the last message in the array is the new one
    const lastMessage =
      normalizedMessages.length > 0
        ? normalizedMessages[normalizedMessages.length - 1]
        : null;
    if (lastMessage && lastMessage.role === "user") {
      await addMessage(chatId, {
        role: "user",
        content: lastMessage.content,
        attachments: attachments,
      });
    }

    // Prepare request body for Azure OpenAI API
    const apiRequestBody = JSON.stringify({
      messages: [
        {
          role: "system",
          content:
            systemPrompt ||
            "You are an AI assistant specialized in code generation and problem-solving. Provide clear, concise, and efficient solutions.",
        },
        ...normalizedMessages,
      ],
      stream: true,
      model: model,
      temperature,
      max_tokens: maxTokens,
      top_p: topP,
    });

    // Call Azure OpenAI API with streaming enabled
    const azureResponse = await fetch(
      "https://models.inference.ai.azure.com/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AZURE_API_KEY}`,
        },
        body: apiRequestBody,
      },
    );

    if (!azureResponse.ok) {
      const errorData = await azureResponse.json();
      throw new Error(
        `Azure OpenAI API error: ${errorData.error?.message || azureResponse.statusText}`,
      );
    }

    // Create a transform stream to capture the full response
    let fullContent = "";
    let buffer = ""; // Buffer for incomplete JSON
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        // Parse the chunk and extract the content
        const text = new TextDecoder().decode(chunk);
        // Add to existing buffer
        buffer += text;

        // Process complete lines
        const lines = buffer.split("\n");
        // Keep the last line if it's incomplete
        buffer = lines.pop() || "";

        for (const line of lines.filter((line) => line.trim() !== "")) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content || "";

              if (content) {
                fullContent += content;
                controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`);
              }
            } catch (e) {
              console.error(
                "Error parsing chunk, skipping incomplete JSON:",
                e.message,
              );
            }
          }
        }
      },
      async flush(controller) {
        // Process any remaining buffer
        if (buffer.trim() !== "") {
          if (buffer.startsWith("data: ")) {
            const data = buffer.slice(6);
            if (data !== "[DONE]") {
              try {
                const parsed = JSON.parse(data);
                const content = parsed.choices?.[0]?.delta?.content || "";
                if (content) {
                  fullContent += content;
                }
              } catch (e) {
                console.error("Error parsing final chunk:", e.message);
              }
            }
          }
        }

        // Send [DONE] marker
        controller.enqueue("data: [DONE]\n\n");

        // Save the complete response to Firestore
        await addMessage(chatId, {
          role: "assistant",
          content: fullContent,
        });
      },
    });

    // Return the streaming response
    return new Response(azureResponse.body?.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
