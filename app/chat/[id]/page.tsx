"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { useChat } from "@/contexts/chat-context";
import { getChat } from "@/lib/chat-service";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useToast } from "@/hooks/use-toast";
import ChatMessage from "@/components/chat/chat-message";
import { ChatForm } from "@/components/chat/chat-form";
import { addMessage } from "@/lib/chat-service";

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

      // Save user message to database first
      await addMessage(params.id, userMessage);
      
      // Then update UI
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
          message: message, // Changed to match API route expectations
          chatId: params.id,
          userId: user.uid,
          attachments: [], // Added empty attachments array for consistency
          systemPrompt: "", // Use default or add system prompt selection
          model: "gpt-4o", // Always use GPT-4o
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

              // Handle different response formats
              if (parsed.content) {
                setStreamingMessage((prev) => prev + parsed.content);
              } else if (parsed.done) {
                // Stream completion marker - ensure we refresh messages
                console.log("Stream completed, refreshing messages");

                // Add a slight delay to ensure the message is saved to Firebase
                setTimeout(async () => {
                  const updatedChat = await getChat(params.id);
                  if (updatedChat) {
                    setMessages(updatedChat.messages || []);
                    setStreamingMessage("");
                  }
                }, 500);
              }
            } catch (e) {
              console.error("Error parsing chunk:", e);
            }
          }
        }
      }

      // After streaming is complete, fetch the updated messages
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
    <div className="flex flex-col w-full md:h-[100dvh] h-[calc(100dvh-60px)] overflow-hidden">
      {/* Chat messages area - Scrollable container */}
      <motion.div 
        className="flex-1 w-full max-w-full overflow-y-auto p-2 pb-4 sm:p-4 sm:pb-6 space-y-4 sm:space-y-6"
        role="log"
        aria-label="Chat conversation"
        aria-live="polite"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {loading ? (
          <motion.div 
            className="flex items-center justify-center h-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            >
              <Loader2 className="h-6 w-6 text-muted-foreground" />
            </motion.div>
          </motion.div>
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
              <motion.div 
                className="flex items-start gap-2 sm:gap-4" 
                role="status" 
                aria-label="Assistant is typing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <motion.div 
                  className="flex h-8 w-8 shrink-0 select-none items-center justify-center rounded-md border text-sm bg-muted text-muted-foreground"
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="h-4 w-4" aria-hidden="true" />
                  </motion.div>
                </motion.div>
                <div className="flex-1 max-w-full w-full space-y-2 w-full sm:max-w-[85%] md:max-w-[90%]">
                  <div className="prose prose-invert max-w-full w-full p-2 sm:p-3 rounded-lg bg-muted border border-primary/20 shadow-sm">
                    {streamingMessage}
                  </div>
                  <div className="text-xs text-muted-foreground animate-pulse">Assistant is typing...</div>
                </div>
              </motion.div>
            )}
          </>
        )}
        <div ref={messagesEndRef} className="h-4" />
      </motion.div>

      {/* Chat input area - Fixed at bottom */}
      <motion.div 
        className="sticky bottom-0 left-0 right-0 border-t border-border/30 w-full bg-background bg-opacity-90 backdrop-blur-md z-20 shadow-md"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
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

                // Save user message to database first
                await addMessage(params.id, userMessage);
                
                // Then update UI
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
                    model: "gpt-4o", // Always use GPT-4o
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

                        // Handle different response formats
                        if (parsed.content) {
                          setStreamingMessage((prev) => prev + parsed.content);
                        } else if (parsed.done) {
                          // Stream completion marker - ensure we refresh messages
                          console.log("Stream completed, refreshing messages");

                          // Add a slight delay to ensure the message is saved to Firebase
                          setTimeout(async () => {
                            const updatedChat = await getChat(params.id);
                            if (updatedChat) {
                              setMessages(updatedChat.messages || []);
                              setStreamingMessage(""); // Clear streaming message
                            }
                          }, 500);
                        }
                      } catch (e) {
                        console.error("Error parsing chunk:", e);
                      }
                    }
                  }
                }

                // After streaming is complete, fetch the updated messages
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
      </motion.div>
    </div>
  );
}
