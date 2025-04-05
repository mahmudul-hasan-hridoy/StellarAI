
import { NextRequest } from "next/server"
import { addMessage } from "@/lib/chat-service"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      chatId,
      userId,
      model = "DeepSeek-V3",
      temperature = 0.7,
      maxTokens = 2048,
      topP = 0.95,
      attachments = []
    } = await req.json()

    // Check for required fields
    if (!chatId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: chatId and userId are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // Handle both single message and messages array format
    const userMessages = Array.isArray(messages) ? messages : [{ role: "user", content: messages.message || messages }];
    
    // Get the latest user message
    const lastMessage = userMessages[userMessages.length - 1]
    if (lastMessage.role !== "user") {
      return new Response(JSON.stringify({ error: "Last message must be from user" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Add user message to Firestore if it's a new message
    await addMessage(chatId, {
      role: "user",
      content: lastMessage.content,
      attachments: attachments,
      timestamp: new Date().toISOString()
    })

    // Prepare messages for the AI model
    const aiMessages = [
      {
        role: "system",
        content: messages.systemPrompt || 
          "You are an AI assistant specialized in code generation and problem-solving. Provide clear, concise, and efficient solutions.",
      },
      ...userMessages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    // Create the AI response stream
    const result = await streamText({
      model: openai("gpt-4o-mini", {
        apiKey: process.env.AZURE_API_KEY || "",
        baseURL: process.env.AZURE_ENDPOINT || "",
        apiVersion: "2023-12-01-preview",
      }),
      messages: aiMessages,
      temperature,
      maxTokens,
      topP,
    });
    
    // Create a readable stream for the client
    const stream = new ReadableStream({
      async start(controller) {
        // Process the stream chunks
        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        
        let text = "";
        const reader = result.getReader();
        
        while (true) {
          const { done, value } = await reader.read();
          
          if (done) {
            // Save the complete response to Firestore
            await addMessage(chatId, {
              role: "assistant",
              content: text,
              timestamp: new Date().toISOString(),
            });
            
            controller.close();
            break;
          }
          
          text += value;
          controller.enqueue(encoder.encode(value));
        }
      }
    });

    return new Response(stream);
  } catch (error) {
    console.error("Error processing request:", error)
    return new Response(
      JSON.stringify({
        error: "Failed to process request",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    )
  }
}
