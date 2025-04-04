import { forwardRef } from "react";
import { formatDistanceToNow } from "date-fns";
import type { Message } from "@/lib/chat-service";
import { Bot, User } from "lucide-react";
import { CodeBlock } from "../code-block";
import { LLMMarkdown } from "../llm-markdown";
import { FileAttachmentDisplay } from "./file-attachment-display";

interface ChatMessageProps {
  message: Message;
}

const ChatMessage = forwardRef<HTMLDivElement, ChatMessageProps>(
  ({ message }, ref) => {
    const isUser = message.role === "user";

    const formatTimestamp = (timestamp: any) => {
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
      <div ref={ref} className="flex items-start gap-2 sm:gap-4 w-full">
        <div className="flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 select-none items-center justify-center rounded-md border text-xs sm:text-sm bg-muted text-muted-foreground">
          {isUser ? <User className="h-3 w-3 sm:h-4 sm:w-4" /> : <Bot className="h-3 w-3 sm:h-4 sm:w-4" />}
        </div>
        <div className="flex-1 space-y-2 sm:space-y-3 w-full sm:max-w-[85%] md:max-w-[90%]">
          {hasAttachments && (
            <div className="mb-2">
              {message.attachments?.map((fileId) => (
                <FileAttachmentDisplay key={fileId} fileId={fileId} />
              ))}
            </div>
          )}

          <LLMMarkdown content={message.content || ""} />
          <div className="text-xs text-muted-foreground">{formattedTime}</div>
        </div>
      </div>
    );
  },
);
export default ChatMessage;