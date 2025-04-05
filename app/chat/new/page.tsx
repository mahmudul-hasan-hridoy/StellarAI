
"use client";

import type React from "react";
import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { createChat } from "@/lib/chat-service";
import { Bot } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { ChatForm } from "@/components/chat/chat-form";
import { motion, AnimatePresence } from "framer-motion";

export default function NewChat() {
  const [isCreating, setIsCreating] = useState(false);
  const [streamingMessage, setStreamingMessage] = useState<string>("");
  const [inputValue, setInputValue] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleExampleClick = (example: string) => {
    setInputValue(example);
  };

  const handleSendMessage = async (message: string, attachments: string[] = []) => {
    if (!user || !message.trim() || isCreating) return;

    try {
      setIsCreating(true);
      setStreamingMessage("");
      setIsSubmitted(true);

      // Create a new chat with the initial message
      const chatId = await createChat(user.uid, message, attachments);
      setCurrentChatId(chatId);

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

              if (parsed.done) {
                // Delay navigation for a smooth transition
                setTimeout(() => {
                  router.push(`/chat/${chatId}`);
                }, 500);
              }
            } catch (e) {
              console.error("Error parsing JSON:", e);
            }
          }
        }
      }

      // Navigate to the new chat (fallback if no 'done' signal received)
      setTimeout(() => {
        router.push(`/chat/${chatId}`);
      }, 1000);
      
    } catch (error) {
      console.error("Error creating chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to create new chat",
      });
      setIsSubmitted(false);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-60px)]">
      {/* Scrollable content area */}
      <AnimatePresence mode="wait">
        {!isSubmitted ? (
          <motion.div 
            className="flex-1 overflow-y-auto p-4 pb-24 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            key="new-chat-form"
          >
            <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl w-full mx-auto my-8">
              <div className="text-center space-y-8">
                <motion.div 
                  className="mx-auto h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center"
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <Bot className="h-8 w-8 text-primary" />
                </motion.div>
                <motion.h1 
                  className="text-2xl font-bold"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.1 }}
                >
                  Start a New Conversation
                </motion.h1>
                <motion.p 
                  className="text-muted-foreground max-w-md mx-auto"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                >
                  Ask me anything about code, programming concepts, or technical
                  problems. I can help generate code, explain concepts, and solve
                  problems.
                </motion.p>

                <motion.div 
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.3 }}
                >
                  <motion.button
                    className="card p-3 cursor-pointer hover:bg-muted/50 transition-colors text-left"
                    onClick={() =>
                      handleExampleClick(
                        "Generate a React component for a responsive navbar",
                      )
                    }
                    disabled={isCreating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="text-sm">
                      "Generate a React component for a responsive navbar"
                    </p>
                  </motion.button>
                  <motion.button
                    className="card p-3 cursor-pointer hover:bg-muted/50 transition-colors text-left"
                    onClick={() =>
                      handleExampleClick(
                        "Explain the difference between promises and async/await",
                      )
                    }
                    disabled={isCreating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="text-sm">
                      "Explain the difference between promises and async/await"
                    </p>
                  </motion.button>
                  <motion.button
                    className="card p-3 cursor-pointer hover:bg-muted/50 transition-colors text-left"
                    onClick={() =>
                      handleExampleClick("Why is my useEffect hook running twice?")
                    }
                    disabled={isCreating}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <p className="text-sm">
                      "Why is my useEffect hook running twice?"
                    </p>
                  </motion.button>
                </motion.div>
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div 
            className="flex-1 overflow-y-auto p-4 pb-24 w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            key="chat-transition"
          >
            <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl w-full mx-auto space-y-4">
              {/* User message */}
              <motion.div 
                className="flex items-start gap-2 sm:gap-4 w-full"
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 select-none items-center justify-center rounded-md border text-xs sm:text-sm bg-muted text-muted-foreground">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-3 w-3 sm:h-4 sm:w-4"
                  >
                    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
                <div className="flex-1 space-y-2 sm:space-y-3 max-w-[97%] sm:max-w-[85%] md:max-w-[90%]">
                  <div className="prose prose-invert max-w-full">
                    {inputValue}
                  </div>
                  <div className="text-xs text-muted-foreground">Just now</div>
                </div>
              </motion.div>
              
              {/* AI response */}
              {streamingMessage && (
                <motion.div 
                  className="flex items-start gap-2 sm:gap-4 w-full"
                  initial={{ x: 20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 select-none items-center justify-center rounded-md border text-xs sm:text-sm bg-muted text-muted-foreground">
                    <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
                  </div>
                  <div className="flex-1 space-y-2 sm:space-y-3 max-w-[97%] sm:max-w-[85%] md:max-w-[90%]">
                    <div className="prose prose-invert max-w-full">
                      {streamingMessage}
                    </div>
                    <motion.div 
                      className="text-xs text-muted-foreground"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
                    >
                      {isCreating ? "Assistant is typing..." : "Just now"}
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat input area - fixed to bottom */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 p-4 bg-[#121212] border-t border-gray-800 w-full bg-opacity-90 backdrop-blur-md z-20 shadow-md"
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <div className="max-w-4xl lg:max-w-5xl xl:max-w-6xl mx-auto">
          <ChatForm
            onSendMessage={handleSendMessage}
            isLoading={isCreating}
            initialValue={inputValue}
            placeholder="How can I help you today?"
          />
        </div>
      </motion.div>
    </div>
  );
}
