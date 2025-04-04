"use client";

import { useState, useRef } from "react";
import { Upload, X, File, Check, Loader2 } from "lucide-react";
import { uploadFileAndSaveMetadata } from "@/lib/file-service";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { StoredFile } from "@/lib/types";
import { truncateFilename } from "@/lib/utils";

interface FileUploadProps {
  onFileUploaded?: (file: StoredFile) => void;
  maxSizeMB?: number;
  acceptedFileTypes?: string[];
  buttonVariant?: "default" | "outline" | "secondary" | "ghost" | "link";
  buttonSize?: "default" | "sm" | "lg" | "icon";
}

export function FileUpload({
  onFileUploaded,
  maxSizeMB = 5,
  acceptedFileTypes,
  buttonVariant = "outline",
  buttonSize = "default",
}: FileUploadProps) {
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxSizeBytes = maxSizeMB * 1024 * 1024;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || !user) return;

    // Validate file size
    if (selectedFile.size > maxSizeBytes) {
      toast({
        title: "File too large",
        description: `Maximum file size is ${maxSizeMB}MB.`,
        variant: "destructive",
      });
      return;
    }

    // Validate file type if specified
    if (acceptedFileTypes && acceptedFileTypes.length > 0) {
      const fileType = selectedFile.type;
      if (
        !acceptedFileTypes.some(
          (type) => fileType.startsWith(type) || type === "*",
        )
      ) {
        toast({
          title: "Invalid file type",
          description: `Accepted file types: ${acceptedFileTypes.join(", ")}`,
          variant: "destructive",
        });
        return;
      }
    }

    try {
      setUploading(true);
      const uploadedFile = await uploadFileAndSaveMetadata(
        selectedFile,
        user.uid,
        (progress) => setProgress(progress),
      );

      if (onFileUploaded) {
        onFileUploaded(uploadedFile);
      }

      toast({
        title: "File uploaded",
        description: "Your file has been uploaded successfully.",
      });

      // Reset state
      setSelectedFile(null);
      setProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const openFileSelector = () => {
    fileInputRef.current?.click();
  };

  const clearSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="w-full space-y-2">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept={acceptedFileTypes?.join(",")}
      />

      {!selectedFile ? (
        <Button
          type="button"
          onClick={openFileSelector}
          variant={buttonVariant}
          size={buttonSize}
          className="w-full flex items-center gap-2"
          disabled={uploading || !user}
        >
          <Upload size={16} />
          <span>Select File</span>
        </Button>
      ) : (
        <div className="border rounded-md p-3 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 truncate">
              <File size={16} />
              <span className="text-sm truncate" title={selectedFile.name}>
                {truncateFilename(selectedFile.name)}
              </span>
              <span className="text-xs text-muted-foreground">
                ({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)
              </span>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={clearSelectedFile}
              disabled={uploading}
            >
              <X size={16} />
            </Button>
          </div>

          {uploading ? (
            <div className="space-y-2">
              <Progress value={progress} className="h-2 w-full" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Uploading...</span>
                <span>{Math.round(progress)}%</span>
              </div>
            </div>
          ) : (
            <Button
              onClick={handleUpload}
              className="w-full"
              disabled={!selectedFile || !user}
            >
              <Check size={16} className="mr-2" />
              Upload File
            </Button>
          )}
        </div>
      )}

      {uploading && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
          <Loader2 size={16} className="animate-spin" />
          <span>Uploading file, please wait...</span>
        </div>
      )}
    </div>
  );
}
