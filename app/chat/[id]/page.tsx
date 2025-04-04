"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useChat } from "@/contexts/chat-context";
import { getChat } from "@/lib/chat-service";
import { Loader2 } from "lucide-react";

import { useToast } from "@/hooks/use-toast";
import ChatMessage from "@/components/chat/chat-message";
import { ChatForm } from "@/components/chat/chat-form";
import { cn } from "@/lib/utils";

// Added attachments property to Message type. Adjust as needed.
type Message = {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  attachments?: { url: string; name: string }[];
};

export default function ChatPage({ params }: { params: { id: string } }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [selectedModel, setSelectedModel] = useState("DeepSeek V3");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { user } = useAuth();
  const { refreshChats, setCurrentChat } = useChat();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    const loadChat = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const chat = await getChat(params.id);
        setCurrentChat(chat);

        if (!chat) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Chat not found",
          });
          router.push("/chat/new");
          return;
        }

        if (chat.userId !== user.uid) {
          toast({
            variant: "destructive",
            title: "Error",
            description: "You don't have access to this chat",
          });
          router.push("/chat/new");
          return;
        }

        setMessages(chat.messages);
      } catch (error) {
        console.error("Error loading chat:", error);
        toast({
          variant: "destructive",
          title: "Error",
          description: "Failed to load chat",
        });
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [user, params.id, router, toast]);

  useEffect(() => {
    // Scroll to bottom when messages change or streaming message updates
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamingMessage]);

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
    if (!user || !inputValue.trim() || sending) return;

    try {
      setSending(true);
      setStreamingMessage("");

      const message = inputValue.trim();
      setInputValue("");

      // Add user message to UI immediately
      const userMessage: Message = {
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMessage]);

      // Scroll to bottom
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 100);

      // Send the message to the API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          chatId: params.id,
          userId: user.uid,
          systemPrompt: "", // Use default or add system prompt selection
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send message");
      }

      if (!response.body) {
        throw new Error("Response body is null");
      }

      // Process the streaming response
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) {
          break;
        }

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n").filter((line) => line.trim() !== "");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = line.slice(6);

            if (data === "[DONE]") {
              continue;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.content || "";

              if (content) {
                setStreamingMessage((prev) => prev + content);
              }
            } catch (e) {
              console.error("Error parsing chunk:", e);
            }
          }
        }
      }

      // After streaming is complete, fetch the updated messages
      const updatedChat = await getChat(params.id);
      if (updatedChat) {
        setMessages(updatedChat.messages || []);
      }

      // Clear streaming message as it's now in the messages array
      setStreamingMessage("");
      refreshChats();
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to send message",
      });

      // Add error message to chat for better UX
      const errorMessage: Message = {
        role: "assistant",
        content:
          "I'm sorry, I encountered an error while processing your request. Please try again later.",
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col w-full h-[calc(100dvh-60px)] md:h-[100dvh] overflow-hidden">
      {/* Chat messages area - Scrollable container */}
      <div className="flex-1 overflow-y-auto p-2 pb-4 sm:p-4 sm:pb-6 space-y-4 sm:space-y-6">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <p className="text-muted-foreground">No messages yet</p>
              <p className="text-sm text-muted-foreground">
                Start the conversation below
              </p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message, index) => (
              <ChatMessage key={message.id || index} message={message} />
            ))}

            {/* Streaming message */}
            {streamingMessage && (
              <div className="flex items-start gap-2 sm:gap-4">
                <div className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border text-sm bg-muted text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                </div>
                <div className="flex-1 space-y-2 w-full sm:max-w-[85%] md:max-w-[90%]">
                  <div className="prose prose-invert max-w-full p-2 sm:p-3 rounded-lg bg-muted">
                    {streamingMessage}
                  </div>
                </div>
              </div>
            )}
          </>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </div>

      {/* Chat input area - Fixed at bottom */}
      <div className="sticky bottom-0 left-0 right-0 border-t border-border/30 w-full bg-background bg-opacity-90 backdrop-blur-md z-20 shadow-md">
        <div className="px-2 py-2 sm:px-4 sm:py-3 mx-auto max-w-screen-lg">
          <ChatForm
            onSendMessage={async (message, attachments) => {
              if (!user || (!message.trim() && attachments.length === 0))
                return;

              try {
                setSending(true);
                setStreamingMessage("");

                // Add user message to UI immediately
                const userMessage: Message = {
                  role: "user",
                  content: message,
                  timestamp: new Date().toISOString(),
                  attachments: attachments.map((attachment) => ({
                    url: attachment,
                    name: attachment,
                  })),
                };

                setMessages((prev) => [...prev, userMessage]);

                // Scroll to bottom
                setTimeout(() => {
                  messagesEndRef.current?.scrollIntoView({
                    behavior: "smooth",
                  });
                }, 100);

                // Send the message to the API
                const response = await fetch("/api/chat", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({
                    message,
                    chatId: params.id,
                    userId: user.uid,
                    attachments: attachments,
                    systemPrompt: "", // Use default or add system prompt selection
                  }),
                });

                if (!response.ok) {
                  const error = await response.json();
                  throw new Error(error.message || "Failed to send message");
                }

                if (!response.body) {
                  throw new Error("Response body is null");
                }

                // Process the streaming response
                const reader = response.body.getReader();
                const decoder = new TextDecoder();

                while (true) {
                  const { done, value } = await reader.read();

                  if (done) {
                    break;
                  }

                  const chunk = decoder.decode(value, { stream: true });
                  const lines = chunk
                    .split("\n")
                    .filter((line) => line.trim() !== "");

                  for (const line of lines) {
                    if (line.startsWith("data: ")) {
                      const data = line.slice(6);

                      if (data === "[DONE]") {
                        continue;
                      }

                      try {
                        const parsed = JSON.parse(data);
                        const content = parsed.content || "";

                        if (content) {
                          setStreamingMessage((prev) => prev + content);
                        }
                      } catch (e) {
                        console.error("Error parsing chunk:", e);
                      }
                    }
                  }
                }

                // After streaming is complete, fetch the updated messages
                const updatedChat = await getChat(params.id);
                if (updatedChat) {
                  setMessages(updatedChat.messages || []);
                }

                // Clear streaming message as it's now in the messages array
                setStreamingMessage("");
                refreshChats();
              } catch (error) {
                console.error("Error sending message:", error);
                toast({
                  variant: "destructive",
                  title: "Error",
                  description:
                    error instanceof Error
                      ? error.message
                      : "Failed to send message",
                });

                // Add error message to chat for better UX
                const errorMessage: Message = {
                  role: "assistant",
                  content:
                    "I'm sorry, I encountered an error while processing your request. Please try again later.",
                  timestamp: new Date().toISOString(),
                };

                setMessages((prev) => [...prev, errorMessage]);
              } finally {
                setSending(false);
              }
            }}
            isLoading={sending}
            initialValue={inputValue}
            onInputChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="How can I help you today?"
          />
        </div>
      </div>
    </div>
  );
}
