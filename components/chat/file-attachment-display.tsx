
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileIcon, ExternalLink, Download, Info } from "lucide-react";
import { FileViewer } from "@/components/file-viewer";
import { getFileById } from "@/lib/file-service";
import { truncateFilename } from "@/lib/utils";
import { StoredFilePreview } from "@/components/file-preview";
import type { StoredFile } from "@/lib/types";
import { motion } from "framer-motion";

interface FileAttachmentDisplayProps {
  fileId: string;
}

export function FileAttachmentDisplay({ fileId }: FileAttachmentDisplayProps) {
  const [file, setFile] = useState<StoredFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

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
      <div className="flex items-center p-3 text-sm bg-secondary/20 rounded-lg border border-border/40 animate-pulse">
        <div className="h-10 w-10 rounded-md bg-secondary/50 mr-3"></div>
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 bg-secondary/50 rounded"></div>
          <div className="h-3 w-16 bg-secondary/30 rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !file) {
    return (
      <div className="flex items-center p-3 text-sm bg-destructive/10 rounded-lg border border-destructive/20">
        <FileIcon className="mr-2 h-5 w-5 text-destructive/70" />
        <span className="text-foreground/80">Attachment unavailable</span>
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
    <motion.div 
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className="mb-3 rounded-lg overflow-hidden"
    >
      <div className="w-full sm:max-w-md">
        <StoredFilePreview 
          file={file} 
          onClick={() => isPreviewable && setViewerOpen(true)}
          showRemoveButton={false}
          className="w-full"
        />
        
        <motion.div 
          className="flex mt-2 justify-end gap-2"
          initial={{ opacity: 0.5 }}
          animate={{ opacity: isHovering ? 1 : 0.8 }}
          transition={{ duration: 0.2 }}
        >
          {isPreviewable && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setViewerOpen(true)}
              className="h-8 bg-secondary/40 hover:bg-primary/10 hover:text-primary border-border/50 hover:border-primary/30 transition-all duration-200"
            >
              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs sm:text-sm">Preview</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="h-8 bg-secondary/40 hover:bg-primary/10 hover:text-primary border-border/50 hover:border-primary/30 transition-all duration-200" 
            asChild
          >
            <a href={file.fileUrl} download={file.fileName}>
              <Download className="h-3.5 w-3.5 mr-1.5" />
              <span className="text-xs sm:text-sm">Download</span>
            </a>
          </Button>
        </motion.div>
      </div>

      <FileViewer file={file} open={viewerOpen} onOpenChange={setViewerOpen} />
    </motion.div>
  );
}
