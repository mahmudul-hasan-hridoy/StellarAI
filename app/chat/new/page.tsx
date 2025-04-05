"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { createChat } from "@/lib/chat-service";
import { Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { ChatForm } from "@/components/chat/chat-form";

export default function NewChat() {
  const [isCreating, setIsCreating] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [selectedModel, setSelectedModel] = useState("DeepSeek-V3");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const adjustHeight = () => {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    };

    textarea.addEventListener("input", adjustHeight);
    adjustHeight();

    return () => {
      textarea.removeEventListener("input", adjustHeight);
    };
  }, [inputValue]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !inputValue.trim() || isCreating) return;

    try {
      setIsCreating(true);
      setStreamingMessage("");

      // Create a new chat with the initial message
      const chatId = await createChat(user.uid, inputValue);

      // Reset input
      setInputValue("");

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }

      // Stream the AI response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: inputValue,
          chatId: chatId,
          userId: user.uid,
          systemPrompt:
            "You are an AI assistant specialized in code generation and problem-solving. Provide clear, concise, and efficient solutions.",
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || `API responded with status ${response.status}`,
        );
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error("Failed to get response reader");
      }

      const decoder = new TextDecoder();
      let accumulatedResponse = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Simplified streaming with AI SDK - direct text stream
        const text = decoder.decode(value, { stream: true });
        accumulatedResponse += text;
        setStreamingMessage(accumulatedResponse);
      }

      // Navigate to the new chat
      router.push(`/chat/${chatId}`);
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create new chat",
      });
    } finally {
      setIsCreating(false);
      setStreamingMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleExampleClick = (example: string) => {
    setInputValue(example);
    // Focus and adjust height
    if (textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)]">
      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto p-4 pb-24 w-full">
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl w-full mx-auto my-8">
          <div className="text-center space-y-8">
            <div className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Bot className="h-8 w-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">Start a New Conversation</h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              Ask me anything about code, programming concepts, or technical
              problems. I can help generate code, explain concepts, and solve
              problems.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
              <button
                className="card p-3 cursor-pointer hover:bg-muted/50 transition-colors text-left"
                onClick={() =>
                  handleExampleClick(
                    "Generate a React component for a responsive navbar",
                  )
                }
                disabled={isCreating}
              >
                <p className="text-sm">
                  "Generate a React component for a responsive navbar"
                </p>
              </button>
              <button
                className="card p-3 cursor-pointer hover:bg-muted/50 transition-colors text-left"
                onClick={() =>
                  handleExampleClick(
                    "Explain the difference between promises and async/await",
                  )
                }
                disabled={isCreating}
              >
                <p className="text-sm">
                  "Explain the difference between promises and async/await"
                </p>
              </button>
              <button
                className="card p-3 cursor-pointer hover:bg-muted/50 transition-colors text-left"
                onClick={() =>
                  handleExampleClick("Why is my useEffect hook running twice?")
                }
                disabled={isCreating}
              >
                <p className="text-sm">
                  "Why is my useEffect hook running twice?"
                </p>
              </button>
            </div>

            {/* Streaming message */}
            {streamingMessage && (
              <div className="mt-6 text-left p-4 border rounded-lg bg-muted">
                <div className="flex items-center gap-2 mb-2">
                  <span className="animate-spin h-3 w-3 border-2 border-white border-t-transparent rounded-full"></span>
                  <p className="text-sm font-medium">Generating response...</p>
                </div>
                <div className="prose prose-invert max-w-none text-sm">
                  {streamingMessage}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Chat input area - fixed to bottom */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-[#121212] border-t border-gray-800 w-full bg-opacity-90 backdrop-blur-md z-20 shadow-md">
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
          <ChatForm
            onSendMessage={async (message, attachments) => {
              if (!user || !message.trim()) return;
              
              try {
                setIsCreating(true);
                setStreamingMessage("");
                
                // Create a new chat with the initial message and any attachments
                const chatId = await createChat(user.uid, message, attachments);
                
                // Stream the AI response
                const response = await fetch("/api/chat", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    message: message,
                    chatId: chatId,
                    userId: user.uid,
                    attachments: attachments,
                    systemPrompt:
                      "You are an AI assistant specialized in code generation and problem-solving. Provide clear, concise, and efficient solutions.",
                  }),
                });
                
                if (!response.ok) {
                  const errorData = await response.json();
                  throw new Error(
                    errorData.error || `API responded with status ${response.status}`,
                  );
                }
                
                const reader = response.body?.getReader();
                if (!reader) {
                  throw new Error("Failed to get response reader");
                }
                
                const decoder = new TextDecoder();
                let accumulatedResponse = "";
                
                while (true) {
                  const { done, value } = await reader.read();
                  if (done) break;
                  
                  const chunk = decoder.decode(value, { stream: true });
                  const lines = chunk.split("\n").filter((line) => line.trim() !== "");
                  
                  for (const line of lines) {
                    if (line.startsWith("data: ")) {
                      const data = line.slice(6);
                      
                      if (data === "[DONE]") {
                        // End of stream
                        break;
                      }
                      
                      try {
                        const parsed = JSON.parse(data);
                        
                        if (parsed.error) {
                          throw new Error(parsed.error);
                        }
                        
                        if (parsed.content) {
                          accumulatedResponse += parsed.content;
                          setStreamingMessage(accumulatedResponse);
                        }
                      } catch (e) {
                        console.error("Error parsing JSON:", e);
                      }
                    }
                  }
                }
                
                // Navigate to the new chat
                router.push(`/chat/${chatId}`);
              } catch (error) {
                console.error("Error creating chat:", error);
                toast({
                  variant: "destructive",
                  title: "Error",
                  description:
                    error instanceof Error ? error.message : "Failed to create new chat",
                });
              } finally {
                setIsCreating(false);
                setStreamingMessage("");
              }
            }}
            isLoading={isCreating}
            initialValue={inputValue}
            placeholder="How can I help you today?"
          />
        </div>
      </div>
    </div>
  );
}
