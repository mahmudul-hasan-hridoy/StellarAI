import type { NextRequest } from "next/server";
import { addMessage } from "@/lib/chat-service";
import { StreamingTextResponse, OpenAIStream } from 'ai';

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

    // Log the request body for debugging
    console.log("Request body:", JSON.stringify(body));

    // Check for required fields with more detailed error response
    const missingFields = [];
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
    const normalizedMessages = messages || (message ? [{ role: "user", content: message }] : []);

    // Get the latest user message
    const userMessage = normalizedMessages.find((msg: any) => msg.role === "user");
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
    const lastMessage = normalizedMessages.length > 0 ? normalizedMessages[normalizedMessages.length - 1] : null;
    if (lastMessage && lastMessage.role === "user") {
      await addMessage(chatId, {
        role: "user",
        content: lastMessage.content,
        attachments: attachments,
      });
    }

    // Prepare complete messages array including system prompt
    const completeMessages = [
      {
        role: "system",
        content:
          systemPrompt ||
          "You are an AI assistant specialized in code generation and problem-solving. Provide clear, concise, and efficient solutions.",
      },
      ...normalizedMessages,
    ];

    // Call Azure OpenAI API with streaming enabled
    const azureResponse = await fetch(
      "https://models.inference.ai.azure.com/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.AZURE_API_KEY}`,
        },
        body: JSON.stringify({
          messages: completeMessages,
          stream: true,
          model: model,
          temperature,
          max_tokens: maxTokens,
          top_p: topP,
        }),
      },
    );

    if (!azureResponse.ok) {
      const errorData = await azureResponse.json();
      throw new Error(
        `Azure OpenAI API error: ${errorData.error?.message || azureResponse.statusText}`,
      );
    }

    // Use AI SDK to convert Azure stream to standard OpenAI-like stream format
    const openAIStream = OpenAIStream(azureResponse, {
      onCompletion: async (completion) => {
        // Save the complete response to Firestore
        await addMessage(chatId, {
          role: "assistant",
          content: completion,
        });
      },
    });

    // Return the streaming response using AI SDK
    return new StreamingTextResponse(openAIStream);
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