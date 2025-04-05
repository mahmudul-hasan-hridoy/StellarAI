import type { NextRequest } from "next/server";
import { addMessage } from "@/lib/chat-service";

export const runtime = "nodejs";
// export const maxDuration = 60

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      systemPrompt = "",
      chatId,
      userId,
      model = "DeepSeek-V3",
      temperature = 0.7,
      maxTokens = 2048,
      topP = 0.95,
    } = await req.json();

    // Check for required fields
    if (!messages || !chatId || !userId) {
      return new Response(
        JSON.stringify({
          error:
            "Missing required fields: messages, chatId, and userId are required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Get the latest user message
    const userMessage = messages.find((msg: any) => msg.role === "user");
    if (!userMessage) {
      return new Response(
        JSON.stringify({
          error: "No user message found in the messages array",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    // Add user message to Firestore if it's a new message
    // We're assuming the last message in the array is the new one
    const lastMessage = messages[messages.length - 1];
    if (lastMessage.role === "user") {
      await addMessage(chatId, {
        role: "user",
        content: lastMessage.content,
      });
    }

    // Prepare request body for Azure OpenAI API
    const body = JSON.stringify({
      messages: [
        {
          role: "system",
          content:
            systemPrompt ||
            "You are an AI assistant specialized in code generation and problem-solving. Provide clear, concise, and efficient solutions.",
        },
        ...messages,
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
        body,
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
    const transformStream = new TransformStream({
      async transform(chunk, controller) {
        // Parse the chunk and extract the content
        const text = new TextDecoder().decode(chunk);
        const lines = text.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
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
              console.error("Error parsing chunk:", e);
            }
          }
        }
      },
      async flush(controller) {
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
