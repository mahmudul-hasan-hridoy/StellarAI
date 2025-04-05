"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2, Wand2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { FileAttachment } from "@/components/file-attachment";
import { StoredFilePreview } from "@/components/file-preview";
import type { StoredFile } from "@/lib/types";

interface ChatFormProps {
  onSendMessage: (message: string, attachments: string[]) => Promise<void>;
  isLoading?: boolean;
  initialValue?: string;
  placeholder?: string;
  showModelSelection?: boolean;
  onInputChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
}

export function ChatForm({
  onSendMessage,
  isLoading = false,
  initialValue = "",
  placeholder = "How can I help you today?",
  showModelSelection = true,
  onInputChange,
  onKeyDown,
}: ChatFormProps) {
  const [inputValue, setInputValue] = useState(initialValue);
  const [attachedFiles, setAttachedFiles] = useState<StoredFile[]>([]);

  const textareaRef = useRef<HTMLTextAreaElement>(null);

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
    if (!inputValue.trim() && attachedFiles.length === 0) return;

    try {
      // Get the user's message
      let processedMessage = inputValue;
      
      // When there are attachments but no text, add a default message
      if (!processedMessage.trim() && attachedFiles.length > 0) {
        processedMessage = "Please analyze the attached file(s).";
      }

      // Send message with file IDs for backend storage
      // The actual file processing will happen in the API route
      const fileIds = attachedFiles.map((file) => file.id);
      await onSendMessage(processedMessage, fileIds);

      setInputValue("");
      setAttachedFiles([]);

      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="w-full max-w-full">
      <motion.div 
        className="relative rounded-lg sm:rounded-xl overflow-hidden border border-gray-700"
        initial={{ y: 10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        whileHover={{ boxShadow: "0 0 0 1px rgba(255, 255, 255, 0.1)" }}
      >
        {attachedFiles.length > 0 && (
          <div className="px-2 sm:px-4 pt-2 sm:pt-3 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {attachedFiles.map((file) => (
              <div key={file.id} className="w-full">
                <StoredFilePreview
                  file={file}
                  onRemove={(id) => 
                    setAttachedFiles((files) => 
                      files.filter((f) => f.id !== id)
                    )
                  }
                />
              </div>
            ))}
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            onInputChange && onInputChange(e);
          }}
          onKeyDown={(e) => {
            onKeyDown ? onKeyDown(e) : handleKeyDown(e);
          }}
          placeholder={
            attachedFiles.length > 0
              ? "Add a message or send attachment..."
              : placeholder
          }
          className="w-full bg-transparent text-white px-2 sm:px-4 py-2 sm:py-3 text-sm sm:text-base resize-none outline-none min-h-[44px] sm:min-h-[60px]"
          style={{ maxHeight: "120px", overflowY: "auto" }}
          disabled={isLoading}
        />

        <div className="flex items-center justify-between px-1 sm:px-2 py-1 sm:py-2 border-t border-gray-700">
          <div className="flex items-center space-x-1 sm:space-x-2">
            <FileAttachment
              onAttach={(file) => setAttachedFiles((prev) => [...prev, file])}
              onRemove={(fileId) =>
                setAttachedFiles((prev) => prev.filter((f) => f.id !== fileId))
              }
              attachedFiles={attachedFiles}
              maxFiles={5}
            />
            <button
              type="button"
              className="p-1 sm:p-2 text-gray-400 hover:text-white rounded-full"
              disabled={isLoading}
            >
              <Wand2 size={16} className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
            </button>
          </div>

          <div className="flex items-center gap-1 sm:gap-2">
            <div className="flex items-center gap-2">
              {showModelSelection && (
                <div className="text-xs sm:text-sm text-gray-400 hidden sm:block">
                  GPT-4o
                </div>
              )}
            </div>
            <motion.button
              type="submit"
              disabled={
                (!inputValue.trim() && attachedFiles.length === 0) || isLoading
              }
              className={cn(
                "p-1.5 sm:p-2 text-white rounded-full",
                (!inputValue.trim() && attachedFiles.length === 0) || isLoading
                  ? "opacity-50"
                  : "bg-primary/90 hover:bg-primary",
              )}
              aria-label={isLoading ? "Sending message..." : "Send message"}
              title={isLoading ? "Sending..." : "Send message"}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {isLoading ? (
                <span className="flex items-center justify-center h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden="true">
                  <span className="animate-spin h-2.5 w-2.5 sm:h-3 sm:w-3 border-2 border-white border-t-transparent rounded-full"></span>
                </span>
              ) : (
                <ArrowUp className="h-4 w-4 sm:h-[18px] sm:w-[18px]" aria-hidden="true" />
              )}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </form>
  );
}
