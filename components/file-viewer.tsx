"use client";

import { useState } from "react";
import Image from "next/image";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink, Download, Info } from "lucide-react";
import type { StoredFile } from "@/lib/types";

interface FileViewerProps {
  file: StoredFile;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function FileViewer({
  file,
  open = false,
  onOpenChange,
}: FileViewerProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  // Render content based on file type
  const fileType = typeof file.fileType === 'string' ? file.fileType : '';
  
  const renderContent = () => {
    if (fileType.startsWith("image/")) {
      return (
        <div className="relative w-full aspect-[4/3] bg-secondary/50 rounded-md overflow-hidden">
          <Image
            src={file.fileUrl ?? ''}
            alt={file.fileName}
            fill
            className="object-contain"
          />
        </div>
      );
    }

    if (fileType.startsWith("video/")) {
      return (
        <video
          src={file.fileUrl}
          controls
          className="w-full max-h-[70vh] rounded-md"
        />
      );
    }

    if (fileType.startsWith("audio/")) {
      return <audio src={file.fileUrl} controls className="w-full" />;
    }

    if (file.fileType === "application/pdf") {
      return (
        <iframe
          src={file.fileUrl}
          className="w-full h-[70vh] rounded-md border"
          title={file.fileName}
        />
      );
    }

    // Default for other file types
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center space-y-4">
        <div className="w-20 h-20 bg-secondary/50 rounded-lg flex items-center justify-center text-4xl">
          {getFileIcon(fileType)}
        </div>
        <div className="text-lg font-medium">{file.fileName}</div>
        <p className="text-muted-foreground">
          This file type cannot be previewed directly.
        </p>
        <div className="flex gap-2 mt-4">
          <Button asChild>
            <a href={file.fileUrl} download={file.fileName}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </a>
          </Button>
          <Button variant="outline" asChild>
            <a href={file.fileUrl} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="mr-2 h-4 w-4" />
              Open in new tab
            </a>
          </Button>
        </div>
      </div>
    );
  };

  // Helper to get file icon based on type
  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith("image/")) return "🖼️";
    if (fileType.startsWith("video/")) return "🎬";
    if (fileType.startsWith("audio/")) return "🎵";
    if (fileType.includes("pdf")) return "📄";
    if (fileType.includes("word") || fileType.includes("document")) return "📝";
    if (fileType.includes("sheet") || fileType.includes("excel")) return "📊";
    if (fileType.includes("presentation") || fileType.includes("powerpoint"))
      return "📽️";
    return "📁";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
        <DialogTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2 truncate">
            <span>{getFileIcon(fileType)}</span>
            <span className="truncate" title={file.fileName}>
              {file.fileName}
            </span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDetails(!showDetails)}
            title="Toggle file details"
          >
            <Info className="h-4 w-4" />
          </Button>
        </DialogTitle>

        {showDetails && (
          <DialogDescription>
            <div className="grid grid-cols-2 gap-2 text-sm mb-4">
              <div>
                <span className="text-muted-foreground">Type:</span>{" "}
                {file.fileType}
              </div>
              <div>
                <span className="text-muted-foreground">Size:</span>{" "}
                {formatFileSize(file.fileSize ?? 0)}
              </div>
              <div>
                <span className="text-muted-foreground">Uploaded:</span>{" "}
                {formatDate(file.uploadedAt)}
              </div>
            </div>
          </DialogDescription>
        )}

        <div className="mt-2">{renderContent()}</div>
      </DialogContent>
    </Dialog>
  );
}
