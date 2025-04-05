import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { addMessage } from "@/lib/chat-service";

export async function POST(req: NextRequest) {
  try {
    const { messages, message, chatId, userId, systemPrompt = "", model = "gpt-4o" } = await req.json();

    // Handle both message (string) and messages (array) formats
    const messageArray = messages || (message ? [{ role: "user", content: message }] : null);

    // Validate required fields
    if (!messageArray || !chatId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    // Initialize OpenAI client with Azure configuration
    const client = new OpenAI({
      apiKey: process.env.AZURE_API_KEY,
      baseURL: process.env.AZURE_ENDPOINT,
    });

    // Prepare messages for the API
    const apiMessages = [{ role: "system", content: systemPrompt }, ...messageArray];

    // Create a stream
    const stream = new TransformStream();
    const writer = stream.writable.getWriter();
    const encoder = new TextEncoder();

    // Start the OpenAI stream
    const openaiStream = await client.chat.completions.create({
      model: model,
      messages: apiMessages,
      stream: true,
      stream_options: { include_usage: true },
      temperature: 0.7,
      max_tokens: 2048,
      top_p: 0.95,
    });

    // Process the stream
    (async () => {
      let fullResponse = "";
      let usage = null;

      try {
        for await (const part of openaiStream) {
          // Extract content
          const content = part.choices[0]?.delta?.content || "";
          if (content) {
            fullResponse += content;

            // Send the chunk to the client
            const chunk = JSON.stringify({ content });
            await writer.write(encoder.encode(`data: ${chunk}\n\n`));
          }
        }

        // Save the complete response to the database
        if (fullResponse) {
          await addMessage(chatId, {
            role: "assistant",
            content: fullResponse,
          });
        }

        // Send the final message with usage data
        if (usage) {
          await writer.write(
            encoder.encode(
              `data: ${JSON.stringify({ done: true, usage })}\n\n`,
            ),
          );
        }

        // Send the [DONE] message
        await writer.write(encoder.encode("data: [DONE]\n\n"));
      } catch (error) {
        console.error("Error processing stream:", error);
        await writer.write(
          encoder.encode(
            `data: ${JSON.stringify({
              error: "Error processing stream",
            })}\n\n`,
          ),
        );
      } finally {
        await writer.close();
      }
    })();

    return new Response(stream.readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (error) {
    console.error("Error in chat API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}