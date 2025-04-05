"use client";

import React, { useState, useEffect } from "react";
import {
  File,
  FileText,
  ImageIcon,
  Music,
  Video,
  Table,
  FileJson,
  Loader2,
  AlertCircle,
  Download,
  FileArchive,
  FilePdf,
  FileCode,
} from "lucide-react";
import Image from "next/image";
import { getFileById } from "@/lib/file-service";
import { formatFileSize } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

interface FileAttachmentDisplayProps {
  fileId: string;
}

export function FileAttachmentDisplay({
  fileId,
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
      <div className="flex items-center justify-center p-6 border rounded-lg bg-muted/30 animate-pulse">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          <span className="text-xs text-muted-foreground">
            Loading attachment...
          </span>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="flex items-center justify-center p-6 border rounded-lg bg-destructive/10">
        <div className="flex flex-col items-center gap-2">
          <AlertCircle className="h-6 w-6 text-destructive" />
          <span className="text-sm font-medium text-destructive">
            {error || "File unavailable"}
          </span>
        </div>
      </div>
    );
  }

  const getFileIcon = () => {
    const { fileType } = file;
    if (!fileType) return <File className="h-6 w-6 text-muted-foreground" />;

    if (fileType.startsWith("image/"))
      return <ImageIcon className="h-6 w-6 text-blue-500" />;
    if (fileType.startsWith("text/"))
      return <FileText className="h-6 w-6 text-orange-500" />;
    if (fileType.startsWith("audio/"))
      return <Music className="h-6 w-6 text-purple-500" />;
    if (fileType.startsWith("video/"))
      return <Video className="h-6 w-6 text-red-500" />;
    if (
      fileType === "application/vnd.ms-excel" ||
      fileType ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      fileType === "text/csv"
    )
      return <Table className="h-6 w-6 text-green-500" />;
    if (fileType === "application/json")
      return <FileJson className="h-6 w-6 text-yellow-500" />;
    if (fileType === "application/pdf")
      return <FilePdf className="h-6 w-6 text-red-500" />;
    if (fileType.includes("zip") || fileType.includes("compressed"))
      return <FileArchive className="h-6 w-6 text-gray-500" />;
    if (fileType.includes("javascript") || fileType.includes("typescript") || 
        fileType.includes("html") || fileType.includes("css") || 
        fileType.includes("python") || fileType.includes("java"))
      return <FileCode className="h-6 w-6 text-emerald-500" />;

    return <File className="h-6 w-6 text-muted-foreground" />;
  };

  const isImage = file.fileType?.startsWith("image/") && !imageError;

  return (
    <motion.div
      className={cn(
        "border rounded-lg overflow-hidden bg-background shadow-sm transition-all hover:shadow-md",
        isImage ? "w-full max-w-[500px]" : "w-full"
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {isImage && file.fileUrl ? (
        <div className="relative aspect-auto w-full max-h-[300px] overflow-hidden bg-muted/30">
          <Image
            src={file.fileUrl}
            alt={file.fileName || "Image attachment"}
            width={500}
            height={300}
            className="w-full h-auto object-contain"
            unoptimized
            onError={() => setImageError(true)}
          />
        </div>
      ) : null}
      <div className="p-3 flex items-center gap-3">
        <div className="flex-shrink-0">{getFileIcon()}</div>
        <div className="flex-1 min-w-0">
          <div className="font-medium truncate" title={file.fileName}>
            {file.fileName || "Unnamed file"}
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2">
            <span>{file.fileType}</span>
            {file.fileSize && <span>·</span>}
            {file.fileSize && <span>{formatFileSize(file.fileSize)}</span>}
          </div>
        </div>
        <div className="flex gap-2">
          {file.fileUrl && (
            <>
              <a
                href={file.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs px-2 py-1 bg-primary/10 hover:bg-primary/20 text-primary rounded transition-colors"
              >
                View
              </a>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-7 w-7"
                onClick={handleDownload}
                title="Download file"
              >
                <Download className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </motion.div>
  );
}