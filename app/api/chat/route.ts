import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { addMessage } from "@/lib/chat-service";

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      message,
      chatId,
      userId,
      systemPrompt = `Act as a senior software engineer with 10+ years of experience in solving complex problems, debugging code, and delivering clean, scalable architecture. You are assisting me with programming challenges, code optimization, bug fixing, system design, and building features step-by-step with strategic roadmaps.

For each task:

1. Understand the Objective: Analyze the problem or request. Ask clarifying questions if needed.

2. Roadmap First: Before diving into the code, generate a clear, step-by-step roadmap or plan outlining how the solution will be approached.

3. Focus Deeply: Tackle only one step at a time. Wait for confirmation or input before proceeding to the next.

4. Code Quality: All code should be production-ready, scalable, and follow best practices (naming conventions, performance, readability, edge case handling).

5. Explain Thought Process: Briefly explain the why behind decisions—architecture choices, patterns used, and any important trade-offs.

6. Debugging: If asked to fix bugs, analyze the code for issues, explain root causes, and provide a clean, corrected version with reasoning.

7. Keep Me in Control: Wait for my go-ahead before continuing with the next step or implementing deeper layers.

Your job is to make me a more effective developer by being my high-level strategic and technical assistant.`,
      model = "gpt-4o",
      attachments = [],
    } = await req.json();

    // Handle both message (string) and messages (array) formats
    const messageArray =
      messages || (message ? [{ role: "user", content: message }] : null);

    // Validate required fields
    if (!messageArray || !chatId || !userId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    console.log("Processing chat request:", {
      chatId,
      messageCount: messageArray.length,
    });

    // If there are attachments, we could process them here
    // For now, the file references are included in the message content
    // This keeps the approach compatible with text-only LLMs

    // Initialize OpenAI client with Azure configuration
    const client = new OpenAI({
      apiKey: process.env.AZURE_API_KEY,
      baseURL: process.env.AZURE_ENDPOINT,
    });

    // Prepare messages for the API
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...messageArray,
    ];

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

        // Save the complete response to the database - IMPORTANT: do this BEFORE sending done signal
        if (fullResponse) {
          try {
            await addMessage(chatId, {
              role: "assistant",
              content: fullResponse,
              timestamp: new Date().toISOString(), // Add timestamp for consistent message format
            });
          } catch (error) {
            console.error("Error saving message to database:", error);
            // Send error to client so they know something went wrong
            await writer.write(
              encoder.encode(
                `data: ${JSON.stringify({
                  error: "Failed to save message to database",
                })}\n\n`,
              ),
            );
          }
        }

        // Send stream completion signal
        await writer.write(
          encoder.encode(`data: ${JSON.stringify({ done: true })}\n\n`),
        );

        // Also send [DONE] for compatibility with some clients
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
