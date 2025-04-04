"use client";

import { useState } from "react";
import { FileUpload } from "./file-upload";
import { FileList } from "./file-list";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PaperclipIcon, FileIcon, X } from "lucide-react";
import { truncateFilename } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { StoredFile } from "@/lib/types";

interface FileAttachmentProps {
  onAttach: (file: StoredFile) => void;
  onRemove?: (fileId: string) => void;
  attachedFiles?: StoredFile[];
  maxFiles?: number;
}

export function FileAttachment({
  onAttach,
  onRemove,
  attachedFiles = [],
  maxFiles = 5,
}: FileAttachmentProps) {
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleFileUploaded = (file: StoredFile) => {
    onAttach(file);
    setDialogOpen(false);
  };

  const handleSelectFile = (file: StoredFile) => {
    onAttach(file);
    setDialogOpen(false);
  };

  const handleRemoveFile = (fileId: string) => {
    if (onRemove) {
      onRemove(fileId);
    }
  };

  const isAtMaxFiles = attachedFiles.length >= maxFiles;

  return (
    <div className="w-full">
      {/* Attached files display */}
      {attachedFiles.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-2">
          {attachedFiles.map((file) => (
            <div
              key={file.id}
              className="flex items-center gap-1 text-xs bg-secondary/50 rounded-full pl-2 pr-1 py-1"
            >
              <FileIcon className="h-3 w-3" />
              <span className="truncate max-w-[120px]" title={file.fileName}>
                {truncateFilename(file.fileName, 6, 16)}
              </span>
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 rounded-full"
                onClick={() => handleRemoveFile(file.id)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Attachment button & Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="rounded-full h-8 w-8"
            disabled={isAtMaxFiles}
            title={
              isAtMaxFiles
                ? `Maximum ${maxFiles} files allowed`
                : "Attach a file"
            }
          >
            <PaperclipIcon className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Attach a File</DialogTitle>
            <DialogDescription>
              Upload a new file or select from your existing files.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="upload" className="mt-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload New</TabsTrigger>
              <TabsTrigger value="existing">Your Files</TabsTrigger>
            </TabsList>
            <TabsContent value="upload" className="py-4">
              <FileUpload onFileUploaded={handleFileUploaded} maxSizeMB={10} />
            </TabsContent>
            <TabsContent value="existing" className="py-4">
              <FileList onSelectFile={handleSelectFile} selectable />
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </div>
  );
}
