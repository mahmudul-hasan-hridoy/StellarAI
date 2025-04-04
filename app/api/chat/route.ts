import type { NextRequest } from "next/server";
import { addMessage } from "@/lib/chat-service";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const { message, chatId, userId, systemPrompt, attachments = [] } = await req.json();

    if (!chatId || !userId) {
      return new Response(
        JSON.stringify({ error: "ChatId and userId are required" }),
        { status: 400 }
      );
    }

    if (!message && (!attachments || attachments.length === 0)) {
      return new Response(
        JSON.stringify({ error: "Either message or attachments are required" }),
        { status: 400 }
      );
    }

    // Verify authentication from cookie
    const authToken = req.cookies.get("firebase-auth-token")?.value;
    if (!authToken) {
      return new Response(
        JSON.stringify({
          error: "Unauthorized",
          details: "Authentication token is missing",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Workaround to make auth service recognize the user
    // We'll temporarily set a global auth token that the chat service can use
    global.authToken = authToken;
    global.currentUserId = userId;

    // Add user message to Firestore
    await addMessage(chatId, {
      role: "user",
      content: message || "Sent attachment",
      attachments: attachments.length > 0 ? attachments : undefined
    });

    // Prepare request body for Azure OpenAI API
    const body = JSON.stringify({
      messages: [
        {
          role: "system",
          content:
            systemPrompt ||
            "You are an AI assistant specialized in code generation and problem-solving. Provide clear, concise, and efficient solutions.",
        },
        { role: "user", content: message },
      ],
      stream: true,
      model: "Deepseek-v3", // You can make this configurable
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