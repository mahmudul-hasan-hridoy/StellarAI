"use client";

import React, { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Image from "next/image";
import { getFileById } from "@/lib/file-service";
import {
  AlertCircle,
  Download,
  File,
  FileArchive,
  FileCode,
  FileJson,
  FileText,
  ImageIcon,
  Loader2,
  Music,
  Table,
  Video,
  ExternalLink,
} from "lucide-react";

interface FileAttachmentDisplayProps {
  fileId: string;
  compact?: boolean;
}

// Helper function to format file size
const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export function FileAttachmentDisplay({
  fileId,
  compact = false,
}: FileAttachmentDisplayProps) {
  const [file, setFile] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    const loadFile = async () => {
      try {
        setLoading(true);
        setError(null);
        setImageError(false);

        // Ensure fileId is a string before proceeding
        if (typeof fileId !== 'string') {
          console.error(`Invalid file ID type: ${typeof fileId}`);
          setError(`Invalid file ID type: ${typeof fileId}`);
          setLoading(false);
          return;
        }

        console.log(`Loading file with ID: ${fileId}`);
        const fileData = await getFileById(fileId);

        if (!fileData) {
          setError("File not found");
        } else {
          setFile(fileData);
        }
      } catch (error) {
        console.error("Error loading file:", error);
        setError(
          error instanceof Error ? error.message : "Failed to load file"
        );
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [fileId]);

  const handleDownload = () => {
    if (!file || !file.fileUrl) return;

    const link = document.createElement('a');
    link.href = file.fileUrl;
    link.download = file.fileName || 'download';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (loading) {
    return (
      <div className={cn(
        "flex items-center justify-center border rounded-lg bg-muted/30 animate-pulse",
        compact ? "p-3" : "p-6"
      )}>
        <div className="flex flex-col items-center gap-2">
          <Loader2 className={cn("animate-spin text-muted-foreground", compact ? "h-4 w-4" : "h-6 w-6")} />
          <span className={cn("text-muted-foreground", compact ? "text-[10px]" : "text-xs")}>
            Loading...
          </span>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className={cn(
        "flex items-center justify-center border rounded-lg bg-destructive/10",
        compact ? "p-3" : "p-6"
      )}>
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className={cn("text-destructive", compact ? "h-4 w-4" : "h-6 w-6")} />
          <span className={cn("font-medium text-destructive", compact ? "text-xs" : "text-sm")}>
            {error || "File unavailable"}
          </span>
        </div>
      </div>
    );
  }

  const getFileIcon = () => {
    const { fileType } = file;
    if (!fileType) return <File className={cn(compact ? "h-4 w-4" : "h-6 w-6", "text-muted-foreground")} />;

    if (fileType.startsWith("image/")) {
      return imageError ? (
        <ImageIcon className={cn(compact ? "h-4 w-4" : "h-6 w-6", "text-muted-foreground")} />
      ) : null;
    }

    if (fileType.startsWith("audio/")) {
      return <Music className={cn(compact ? "h-4 w-4" : "h-6 w-6", "text-primary")} />;
    }

    if (fileType.startsWith("video/")) {
      return <Video className={cn(compact ? "h-4 w-4" : "h-6 w-6", "text-blue-500")} />;
    }

    if (fileType === "application/pdf") {
      return <FileText className={cn(compact ? "h-4 w-4" : "h-6 w-6", "text-red-500")} />;
    }

    if (
      fileType === "application/json" ||
      fileType === "application/ld+json"
    ) {
      return <FileJson className={cn(compact ? "h-4 w-4" : "h-6 w-6", "text-yellow-500")} />;
    }

    if (
      fileType === "text/csv" ||
      fileType === "application/vnd.ms-excel" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    ) {
      return <Table className={cn(compact ? "h-4 w-4" : "h-6 w-6", "text-green-500")} />;
    }

    if (
      fileType.startsWith("text/") ||
      fileType === "application/rtf" ||
      fileType === "application/msword" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      return <FileText className={cn(compact ? "h-4 w-4" : "h-6 w-6", "text-blue-500")} />;
    }

    if (
      fileType === "application/javascript" ||
      fileType === "application/typescript" ||
      fileType === "application/xml" ||
      fileType === "application/x-httpd-php" ||
      fileType === "text/html" ||
      fileType === "text/css"
    ) {
      return <FileCode className={cn(compact ? "h-4 w-4" : "h-6 w-6", "text-purple-500")} />;
    }

    if (
      fileType === "application/zip" ||
      fileType === "application/gzip" ||
      fileType === "application/x-7z-compressed" ||
      fileType === "application/x-rar-compressed"
    ) {
      return <FileArchive className={cn(compact ? "h-4 w-4" : "h-6 w-6", "text-amber-500")} />;
    }

    return <File className={cn(compact ? "h-4 w-4" : "h-6 w-6", "text-muted-foreground")} />;
  };

  const isImage = file.fileType?.startsWith("image/");
  const maxImageHeight = compact ? 200 : 300;
  const maxWidth = compact ? 300 : 500;

  return (
    <motion.div
      className={cn(
        "border rounded-lg overflow-hidden bg-background shadow-sm transition-all hover:shadow-md",
        isImage ? `w-full max-w-[${maxWidth}px]` : "w-full"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {isImage && file.fileUrl ? (
        <div className={cn(
          "relative aspect-auto w-full overflow-hidden bg-muted/30",
          `max-h-[${maxImageHeight}px]`
        )}>
          <Image
            src={file.fileUrl}
            alt={file.fileName || "Image attachment"}
            width={maxWidth}
            height={maxImageHeight}
            className="w-full h-auto object-contain"
            unoptimized
            onError={() => setImageError(true)}
          />
        </div>
      ) : null}
      <div className={cn("flex items-center gap-3", compact ? "p-2" : "p-3")}>
        <div className="flex-shrink-0">{getFileIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className={cn("font-medium truncate", compact ? "text-sm" : "")} title={file.fileName}>
            {file.fileName || "Unnamed file"}
          </div>
          <div className={cn("text-muted-foreground flex items-center gap-2", compact ? "text-[10px]" : "text-xs")}>
            <span>{file.fileType}</span>
            {file.fileSize && <span>·</span>}
            {file.fileSize && <span>{formatFileSize(file.fileSize)}</span>}
          </div>
        </div>
        <div className="flex gap-1">
          {file.fileUrl && (
            <>
              <a
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={cn("rounded-full hover:bg-muted transition-colors", compact ? "p-1.5" : "p-2")}
                title="Open in new tab"
              >
                <ExternalLink className={cn("text-muted-foreground", compact ? "h-3 w-3" : "h-4 w-4")} />
              </a>
              <button
                onClick={handleDownload}
                className={cn("rounded-full hover:bg-muted transition-colors", compact ? "p-1.5" : "p-2")}
                title="Download file"
              >
                <Download className={cn("text-muted-foreground", compact ? "h-3 w-3" : "h-4 w-4")} />
              </button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}