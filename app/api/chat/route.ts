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
      ...(attachments && attachments.length > 0 && { attachments })
    });

    // Prepare request body for Azure OpenAI API
    const body = JSON.stringify({
      messages: [
        {
          role: "system",
          content:
            (systemPrompt ? 
              systemPrompt + (message.deepThink ? "\nPlease think deeply and thoroughly about your response." : "") :
              `You are an AI assistant specialized in code generation and problem-solving. ${
                message.deepThink ? "Take your time to think deeply and provide thorough, well-reasoned solutions." : 
                "Provide clear, concise, and efficient solutions."
              }`),
        },
        { role: "user", content: message },
      ],
      stream: true,
      model: message.attachments?.length > 0 ? "gpt-4o" : 
             systemPrompt?.includes("deep_think") ? "Deepseek-r1" : 
             "Deepseek-v3",
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
              // Handle [DONE] marker
              if (data.trim() === "[DONE]") {
                continue;
              }

              let jsonData = data;
              // Sometimes the JSON can be prefixed with "data: "
              if (data.startsWith('data: ')) {
                jsonData = data.slice(6);
              }

              // Fix for incomplete or malformed JSON
              try {
                // Try to parse the JSON data
                const parsed = JSON.parse(jsonData);
                const content = parsed.choices?.[0]?.delta?.content;
                
                if (content) {
                  fullContent += content;
                  // Send the chunk with proper SSE format
                  controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`);
                }
              } catch (jsonError) {
                // If JSON parsing fails, try to sanitize the data
                console.warn("JSON parse error, attempting to sanitize:", jsonError.message);
                
                // Try to recover from common JSON errors
                if (jsonData && typeof jsonData === 'string') {
                  // Check if it's a truncated JSON
                  if (jsonData.includes('"content":')) {
                    const contentMatch = jsonData.match(/"content":\s*"([^"]*)"/);
                    if (contentMatch && contentMatch[1]) {
                      const content = contentMatch[1];
                      fullContent += content;
                      controller.enqueue(`data: ${JSON.stringify({ content })}\n\n`);
                    }
                  }
                }
              }
            } catch (e) {
              // Log error but don't throw to keep the stream alive
              console.error("Stream parsing error:", e.message);
              continue;
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
          attachments: []
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
    
    // Save error message to chat for better debugging
    try {
      if (chatId) {
        await addMessage(chatId, {
          role: "assistant",
          content: "Sorry, there was an error processing your request. Please try again.",
          attachments: []
        });
      }
    } catch (saveError) {
      console.error("Error saving error message to chat:", saveError);
    }
    
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