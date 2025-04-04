"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowUp, Loader2, Wand2, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { FileAttachment } from "@/components/file-attachment";
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
  const [selectedModel, setSelectedModel] = useState("deepseek-v3");
  const [deepThink, setDeepThink] = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<StoredFile[]>([]);
  
  // Update model based on attachments and deep think mode
  useEffect(() => {
    if (attachedFiles.length > 0) {
      setSelectedModel("gpt-4o");
    } else if (deepThink) {
      setSelectedModel("Deepseek-r1");
    } else {
      setSelectedModel("Deepseek-v3");
    }
  }, [attachedFiles.length, deepThink]);

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
      const fileIds = attachedFiles.map((file) => file.id);
      await onSendMessage(inputValue, fileIds);
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

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <form onSubmit={handleSendMessage} className="w-full max-w-full">
      <div className="relative rounded-lg sm:rounded-xl overflow-hidden border border-gray-700">
        {attachedFiles.length > 0 && (
          <div className="px-2 sm:px-4 pt-2 sm:pt-3 flex flex-wrap gap-1 sm:gap-2">
            {attachedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center gap-1 text-xs bg-secondary/50 rounded-full pl-2 pr-1 py-0.5 sm:py-1"
              >
                <span
                  className="truncate max-w-[80px] sm:max-w-[120px]"
                  title={file.fileName}
                >
                  {file.fileName}
                </span>
                <button
                  type="button"
                  className="h-4 w-4 rounded-full text-muted-foreground hover:text-foreground"
                  onClick={() =>
                    setAttachedFiles((files) =>
                      files.filter((f) => f.id !== file.id),
                    )
                  }
                >
                  ×
                </button>
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
                <>
                  <button
                    type="button"
                    onClick={() => setDeepThink(!deepThink)}
                    className={cn(
                      "text-xs sm:text-sm px-2 py-1 rounded-md transition-colors",
                      deepThink ? "bg-primary/20 text-primary" : "text-gray-400 hover:text-white"
                    )}
                    title="Toggle Deep Think mode"
                  >
                    🤔 Deep Think
                  </button>
                  <div className="text-xs sm:text-sm text-gray-400 hidden sm:block">
                    {selectedModel}
                  </div>
                </>
              )}
            </div>
            <button
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
            >
              {isLoading ? (
                <span className="flex items-center justify-center h-4 w-4 sm:h-[18px] sm:w-[18px]">
                  <span className="animate-spin h-2.5 w-2.5 sm:h-3 sm:w-3 border-2 border-white border-t-transparent rounded-full"></span>
                </span>
              ) : (
                <ArrowUp className="h-4 w-4 sm:h-[18px] sm:w-[18px]" />
              )}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
