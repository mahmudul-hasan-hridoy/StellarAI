
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FileIcon, ExternalLink, Download, Info, Loader2 } from "lucide-react";
import { FileViewer } from "@/components/file-viewer";
import { getFileById } from "@/lib/file-service";
import { truncateFilename } from "@/lib/utils";
import { StoredFilePreview } from "@/components/file-preview";
import type { StoredFile } from "@/lib/types";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

interface FileAttachmentDisplayProps {
  fileId: string;
}

export function FileAttachmentDisplay({ fileId }: FileAttachmentDisplayProps) {
  const [file, setFile] = useState<StoredFile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewerOpen, setViewerOpen] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();

  useEffect(() => {
    const loadFile = async () => {
      try {
        setLoading(true);
        setError(null);
        
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
          console.error(`File not found: ${fileId}`);
          setError("File not found");
          return;
        }
        
        if (!fileData.fileUrl) {
          console.error(`File URL missing: ${fileId}`);
          setError("File URL missing");
          return;
        }
        
        console.log(`File loaded successfully: ${fileData.fileName}`);
        setFile(fileData);
      } catch (err) {
        console.error(`Error loading file ${fileId}:`, err);
        setError(`Could not load file: ${err instanceof Error ? err.message : 'Unknown error'}`);
      } finally {
        setLoading(false);
      }
    };

    if (fileId) {
      loadFile();
    } else {
      setError("Invalid file ID");
      setLoading(false);
    }
  }, [fileId, retryCount]);

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
  };

  if (loading) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center p-3 text-sm bg-secondary/20 rounded-lg border border-border/40 w-full sm:max-w-md"
      >
        <div className="flex items-center justify-center h-10 w-10 rounded-md bg-secondary/50 mr-3">
          <Loader2 className="h-5 w-5 animate-spin text-primary/70" />
        </div>
        <div className="space-y-2 flex-1">
          <div className="h-4 w-32 bg-secondary/50 rounded animate-pulse"></div>
          <div className="h-3 w-16 bg-secondary/30 rounded animate-pulse"></div>
        </div>
      </motion.div>
    );
  }

  if (error || !file) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col p-3 text-sm bg-background rounded-lg border border-border/30 w-full sm:max-w-md"
      >
        <div className="flex items-center">
          <FileIcon className="mr-2 h-5 w-5 text-destructive/70" />
          <span className="text-foreground/80 font-medium">Attachment unavailable</span>
        </div>
        <p className="text-xs mt-1 text-muted-foreground">{error || "File could not be loaded"}</p>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={handleRetry} 
          className="mt-2 self-end h-7 text-xs"
        >
          Retry loading
        </Button>
      </motion.div>
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
          className="w-full cursor-pointer transition-all duration-200 hover:scale-[1.01] hover:shadow-md"
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
            <a 
              href={file.fileUrl} 
              download={file.fileName}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                toast({
                  title: "Download started",
                  description: `Downloading ${file.fileName}`,
                });
              }}
            >
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
