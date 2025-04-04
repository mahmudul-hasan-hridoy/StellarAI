"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileIcon, ExternalLink, Download } from "lucide-react";
import { FileViewer } from "@/components/file-viewer";
import { getFileById } from "@/lib/file-service";
import { truncateFilename } from "@/lib/utils";
import type { StoredFile } from "@/lib/types";

interface FileAttachmentDisplayProps {
  fileId: string;
}

export function FileAttachmentDisplay({ fileId }: FileAttachmentDisplayProps) {
  const [file, setFile] = useState<StoredFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);

  useEffect(() => {
    const loadFile = async () => {
      try {
        setLoading(true);
        const fileData = await getFileById(fileId);
        setFile(fileData);
      } catch (err) {
        console.error("Error loading file:", err);
        setError("Could not load file");
      } finally {
        setLoading(false);
      }
    };

    loadFile();
  }, [fileId]);

  if (loading) {
    return (
      <div className="flex items-center p-2 text-sm bg-secondary/20 rounded-md">
        <div className="animate-pulse h-5 w-32 bg-secondary/50 rounded"></div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="flex items-center p-2 text-sm bg-secondary/20 rounded-md">
        <FileIcon className="mr-2 h-4 w-4 text-muted-foreground" />
        <span className="text-muted-foreground">Attachment unavailable</span>
      </div>
    );
  }

  // Guarantee a string fileType even if it's missing from the file object
  const fileType = typeof file.fileType === "string" ? file.fileType : "";

  const isImage = fileType.startsWith("image/");
  const isPreviewable =
    isImage ||
    fileType.startsWith("video/") ||
    fileType.startsWith("audio/") ||
    fileType === "application/pdf";

  return (
    <>
      <div
        className={`flex items-start p-2 bg-secondary/20 rounded-md ${isImage ? "flex-col" : "flex-row"}`}
      >
        {isImage ? (
          <div className="w-full space-y-2">
            {/* Thumbnail for images */}
            <div
              className="relative w-full max-w-sm h-32 bg-secondary/30 rounded cursor-pointer overflow-hidden"
              onClick={() => setViewerOpen(true)}
              style={{
                backgroundImage: `url(${file.fileUrl})`,
                backgroundSize: "contain",
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
              }}
            />
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm">
                <FileIcon className="mr-2 h-4 w-4" />
                <span className="truncate max-w-[150px]" title={file.fileName}>
                  {truncateFilename(file.fileName, 10, 20)}
                </span>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewerOpen(true)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                  <a href={file.fileUrl} download={file.fileName}>
                    <Download className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-center flex-1 min-w-0">
              <FileIcon className="mr-2 h-4 w-4 flex-shrink-0" />
              <span className="text-sm truncate" title={file.fileName}>
                {truncateFilename(file.fileName, 12, 24)}
              </span>
            </div>
            <div className="flex ml-2">
              {isPreviewable && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setViewerOpen(true)}
                >
                  <ExternalLink className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" className="h-7 w-7" asChild>
                <a href={file.fileUrl} download={file.fileName}>
                  <Download className="h-4 w-4" />
                </a>
              </Button>
            </div>
          </>
        )}
      </div>

      <FileViewer file={file} open={viewerOpen} onOpenChange={setViewerOpen} />
    </>
  );
}
