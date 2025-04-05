import { forwardRef } from "react";
import { formatDistanceToNow } from "date-fns";
import type { Message } from "@/lib/chat-service";
import { Bot, User } from "lucide-react";
import { motion } from "framer-motion";
import { LLMMarkdown } from "../llm-markdown";
import { FileAttachmentDisplay } from "./file-attachment-display";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ message }, ref) => {
    const isUser = message.role === "user";

    const formatTimestamp = (timestamp: string | number | Date) => {
      try {
        // Check if timestamp is valid
        const date = new Date(timestamp);
        if (isNaN(date.getTime())) {
          return null;
        }
        return formatDistanceToNow(date, {
          addSuffix: true,
        });
      } catch (error) {
        console.error("Error formatting timestamp:", error);
        return null;
      }
    };

    const formattedTime = message.timestamp
      ? formatTimestamp(message.timestamp)
      : null;

    const hasAttachments =
      message.attachments && message.attachments.length > 0;

    return (
      <motion.div 
        ref={ref} 
        className="flex items-start gap-2 sm:gap-4 w-full max-w-full" 
        role="listitem" 
        aria-label={`${isUser ? 'User' : 'Assistant'} message`}
        initial={{ opacity: 0, y: 20, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 select-none items-center justify-center rounded-md border text-xs sm:text-sm bg-muted text-muted-foreground" 
          aria-hidden="true"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.2 }}
        >
          {isUser ? (
            <User className="h-3 w-3 sm:h-4 sm:w-4" />
          ) : (
            <Bot className="h-3 w-3 sm:h-4 sm:w-4" />
          )}
        </motion.div>
        <div className="flex-1 space-y-2 sm:space-y-3 max-w-[97%] sm:max-w-[85%] md:max-w-[90%]">
          {hasAttachments && (
            <div className="mb-3 space-y-2">
              <div className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <span>Attachments:</span>
                <span className="bg-secondary/50 text-muted-foreground px-1.5 py-0.5 rounded text-[10px]">
                  {message.attachments?.length || 0}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                {message.attachments?.map((fileId, index) => {
                  // Ensure fileId is a valid string
                  if (!fileId || typeof fileId !== 'string') {
                    console.error('Invalid attachment ID:', fileId);
                    return null;
                  }
                  
                  return (
                    <motion.div 
                      key={`${fileId}-${index}`}
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: index * 0.1 }}
                      className="w-full sm:max-w-[300px]"
                    >
                      <FileAttachmentDisplay fileId={fileId} compact={true} />
                    </motion.div>
                  );
                })}
              </div>
            </div>
          )}
          <LLMMarkdown content={message.content || "No content available"} />
          <div className="text-xs text-muted-foreground">{formattedTime}</div>
        </div>
      </motion.div>
    );
  },
);

// Add display name for React DevTools
ChatMessage.displayName = "ChatMessage";

export default ChatMessage;