
import { NextRequest } from "next/server"
import { addMessage } from "@/lib/chat-service"
import { streamText } from "ai"
import { openai } from "@ai-sdk/openai"

export const runtime = "nodejs"

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
    } = await req.json()

    // Check for required fields
    if (!messages || !chatId || !userId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: messages, chatId, and userId are required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      )
    }

    // Get the latest user message
    const lastMessage = messages[messages.length - 1]
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
    })

    // Prepare messages for the AI model
    const aiMessages = [
      {
        role: "system",
        content: systemPrompt || 
          "You are an AI assistant specialized in code generation and problem-solving. Provide clear, concise, and efficient solutions.",
      },
      ...messages.map(msg => ({
        role: msg.role,
        content: msg.content,
      })),
    ]

    // Use the AI SDK to stream the response
    const stream = streamText({
      model: openai.azure({
        apiVersion: "2023-12-01-preview",
        endpoint: process.env.AZURE_ENDPOINT || "",
        apiKey: process.env.AZURE_API_KEY || "",
        deployment: "gpt-4o-mini",
      }),
      messages: aiMessages,
      temperature,
      maxTokens,
      topP,
      onCompletion: async (completion) => {
        // Save the complete response to Firestore
        await addMessage(chatId, {
          role: "assistant",
          content: completion,
          timestamp: new Date().toLocaleString(),
        })
      },
    })

    return new Response(stream)
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
