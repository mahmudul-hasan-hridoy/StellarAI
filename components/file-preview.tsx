
"use client";

import React, { type JSX } from "react";
import {
  X,
  File,
  FileText,
  ImageIcon,
  Music,
  Video,
  Table
} from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

interface Attachment {
  file: File;
  preview?: string;
  id: string;
}

interface StoredAttachment {
  id: string;
  fileName: string;
  fileType?: string;
  fileSize?: number;
  fileUrl?: string;
  preview?: string;
}

const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

const getFileIcon = (fileType: string): JSX.Element => {
  if (fileType.startsWith("image/"))
    return <ImageIcon className="h-4 w-4" />;
  if (fileType.startsWith("video/"))
    return <Video className="h-4 w-4" />;
  if (fileType.startsWith("audio/"))
    return <Music className="h-4 w-4" />;
  if (fileType.includes("pdf"))
    return <FileText className="h-4 w-4" />;
  if (fileType.includes("word") || fileType.includes("document"))
    return <FileText className="h-4 w-4" />;
  if (fileType.includes("sheet") || fileType.includes("excel"))
    return <Table className="h-4 w-4" />;
  return <File className="h-4 w-4" />;
};

export const FilePreview = React.memo(
  ({
    attachment,
    onRemove,
    onClick,
    showRemoveButton = true
  }: {
    attachment: Attachment;
    onRemove?: (id: string) => void;
    onClick?: () => void;
    showRemoveButton?: boolean;
  }) => {
    const isImage = attachment.file.type.startsWith("image/");
    const icon = getFileIcon(attachment.file.type);
    const fileSize = formatFileSize(attachment.file.size);

    return (
      <div className="group relative" onClick={onClick}>
        <div className="w-full sm:w-48 cursor-pointer rounded-lg border border-border bg-secondary/30 p-2 transition-all duration-200 hover:bg-secondary/50 hover:border-primary/30 hover:shadow-sm hover:shadow-primary/10">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 overflow-hidden rounded-md">
              {isImage && attachment.preview ? (
                <div className="h-10 w-10 rounded-md overflow-hidden">
                  <img
                    src={attachment.preview}
                    alt={attachment.file.name}
                    className="h-10 w-10 object-cover transition-transform hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary">
                  {icon}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="mt-1 truncate text-sm font-medium">
                {attachment.file.name}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {fileSize}
              </p>
            </div>
          </div>
          {showRemoveButton && onRemove && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onRemove(attachment.id);
              }}
              className="absolute -right-2 -top-2 z-20 overflow-visible rounded-full border border-border bg-card p-1 transition-colors hover:bg-primary/10 hover:border-primary/30 hover:text-primary">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

export const StoredFilePreview = React.memo(
  ({
    file,
    onRemove,
    onClick,
    showRemoveButton = true,
    className
  }: {
    file: StoredAttachment;
    onRemove?: (id: string) => void;
    onClick?: () => void;
    showRemoveButton?: boolean;
    className?: string;
  }) => {
    const fileType = file.fileType || "";
    const isImage = fileType.startsWith("image/");
    const icon = getFileIcon(fileType);
    const fileSize = formatFileSize(file.fileSize || 0);

    return (
      <div className={cn("group relative", className)} onClick={onClick}>
        <div className="w-full cursor-pointer rounded-lg border border-border bg-secondary/30 p-2 transition-all duration-200 hover:bg-secondary/50 hover:border-primary/30 hover:shadow-sm hover:shadow-primary/10">
          <div className="flex items-start gap-2">
            <div className="flex-shrink-0 overflow-hidden rounded-md">
              {isImage && file.fileUrl ? (
                <div className="h-10 w-10 rounded-md overflow-hidden relative">
                  <Image
                    src={file.fileUrl}
                    alt={file.fileName}
                    fill
                    className="object-cover transition-transform hover:scale-105"
                  />
                </div>
              ) : (
                <div className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary">
                  {icon}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="mt-1 truncate text-sm font-medium">
                {file.fileName}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {fileSize}
              </p>
            </div>
          </div>
          {showRemoveButton && onRemove && (
            <button
              type="button"
              onClick={e => {
                e.stopPropagation();
                onRemove(file.id);
              }}
              className="absolute -right-2 -top-2 z-20 overflow-visible rounded-full border border-border bg-card p-1 transition-colors hover:bg-primary/10 hover:border-primary/30 hover:text-primary">
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>
    );
  }
);

FilePreview.displayName = "FilePreview";
StoredFilePreview.displayName = "StoredFilePreview";
