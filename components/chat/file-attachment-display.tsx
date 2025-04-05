"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileIcon, ExternalLink, Download } from "lucide-react";
import { FileViewer } from "@/components/file-viewer";
import { getFileById } from "@/lib/file-service";
import { truncateFilename } from "@/lib/utils";
import { StoredFilePreview } from "@/components/file-preview";
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
  const isPreviewable = fileType.startsWith("image/") ||
    fileType.startsWith("video/") ||
    fileType.startsWith("audio/") ||
    fileType === "application/pdf";

  return (
    <>
      <div className="mb-2">
        <StoredFilePreview 
          file={file} 
          onClick={() => isPreviewable && setViewerOpen(true)}
          showRemoveButton={false}
        />
        <div className="flex mt-2 justify-end gap-1">
          {isPreviewable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewerOpen(true)}
              className="h-7"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              Preview
            </Button>
          )}
          <Button variant="outline" size="sm" className="h-7" asChild>
            <a href={file.fileUrl} download={file.fileName}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              Download
            </a>
          </Button>
        </div>
      </div>

      <FileViewer file={file} open={viewerOpen} onOpenChange={setViewerOpen} />
    </>
  );
}