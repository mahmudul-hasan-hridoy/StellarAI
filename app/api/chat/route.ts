import { type NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { addMessage } from "@/lib/chat-service";
import { getFileById } from "@/lib/file-service";

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

    // Process attachments if present
    let processedMessages = [...messageArray];

    // If there are attachments, process them for AI model compatibility
    if (attachments && attachments.length > 0) {
      try {
        console.log(`Processing ${attachments.length} attachments:`, attachments);
        const lastMessageIndex = processedMessages.length - 1;
        
        // Ensure the content object is properly structured for attachments
        let content = 
          typeof processedMessages[lastMessageIndex].content === 'string' 
            ? [{ type: 'text', text: processedMessages[lastMessageIndex].content }] 
            : processedMessages[lastMessageIndex].content;
        
        // If content is already an array, ensure it has the right format
        if (!Array.isArray(content)) {
          content = [{ type: 'text', text: String(content) }];
        }
        
        // Process each attachment
        for (const attachmentId of attachments) {
          console.log(`Processing attachment ID: ${attachmentId}`);
          const file = await getFileById(attachmentId);
          
          if (!file) {
            console.error(`File not found for ID: ${attachmentId}`);
            content.push({
              type: 'text',
              text: `[File not found for ID: ${attachmentId}]`
            });
            continue;
          }
          
          if (!file.fileUrl) {
            console.error(`File URL missing for: ${file.fileName} (${attachmentId})`);
            content.push({
              type: 'text',
              text: `[File URL missing: ${file.fileName}]`
            });
            continue;
          }
          
          console.log(`Processing file: ${file.fileName} (${file.fileType})`);
          
          try {
            // Fetch the file content and convert to base64
            const response = await fetch(file.fileUrl);
            
            if (!response.ok) {
              throw new Error(`Failed to fetch file: ${response.status} ${response.statusText}`);
            }
            
            const arrayBuffer = await response.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            
            // Add image attachment in OpenAI-compatible format
            if (file.fileType?.startsWith('image/')) {
              console.log(`Adding image attachment: ${file.fileName}`);
              content.push({
                type: 'image_url',
                image_url: {
                  url: `data:${file.fileType};base64,${base64}`
                }
              });
            } else {
              // For non-image files, include as text with base64 data
              console.log(`Adding non-image attachment: ${file.fileName}`);
              content.push({
                type: 'text',
                text: `[File: ${file.fileName} (${file.fileType})]
                Content (base64): ${base64.substring(0, 100)}...`
              });
            }
          } catch (error) {
            console.error(`Error processing attachment ${attachmentId}:`, error);
            content.push({
              type: 'text',
              text: `[Error processing attachment: ${file.fileName} - ${error instanceof Error ? error.message : 'Unknown error'}]`
            });
          }
        }
        
        // Replace the last message content with the processed content
        processedMessages[lastMessageIndex] = {
          ...processedMessages[lastMessageIndex],
          content
        };
      } catch (error) {
        console.error('Error processing attachments:', error);
      }
    }

    // Initialize OpenAI client with Azure configuration
    const client = new OpenAI({
      apiKey: process.env.AZURE_API_KEY,
      baseURL: process.env.AZURE_ENDPOINT,
    });

    // Prepare messages for the API
    const apiMessages = [
      { role: "system", content: systemPrompt },
      ...processedMessages,
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
