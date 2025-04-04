
"use client";

import { useState } from "react";
import { FileUpload } from "@/components/file-upload";
import { FileList } from "@/components/file-list";
import { FileViewer } from "@/components/file-viewer";
import { useAuth } from "@/contexts/auth-context";
import LayoutWrapper from "@/components/layout-wrapper";
import type { StoredFile } from "@/lib/types";

export default function FilesPage() {
  const { user } = useAuth();
  const [viewingFile, setViewingFile] = useState<StoredFile | null>(null);
  const [isFileViewerOpen, setIsFileViewerOpen] = useState(false);

  const handleFileUploaded = (file: StoredFile) => {
    // Just refresh the file list
  };

  const handleViewFile = (file: StoredFile) => {
    setViewingFile(file);
    setIsFileViewerOpen(true);
  };

  return (
    <LayoutWrapper>
      <div className="container-custom py-8 md:py-12">
        <div className="flex flex-col gap-8">
          <div>
            <h1 className="mb-4">Your Files</h1>
            <p className="text-muted-foreground mb-6">
              Upload, view, and manage your files. These files can be attached to your chats.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-8">
            <div className="space-y-4">
              <div className="bg-card rounded-lg border p-4">
                <h3 className="text-lg font-medium mb-4">Upload New File</h3>
                <FileUpload 
                  onFileUploaded={handleFileUploaded} 
                  maxSizeMB={10}
                  buttonVariant="default"
                />
              </div>
              
              <div className="bg-card rounded-lg border p-4">
                <h3 className="text-lg font-medium mb-4">Storage Info</h3>
                <div className="space-y-2 text-sm">
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">Files:</span>
                    <span>Managing files</span>
                  </p>
                  <p className="flex justify-between">
                    <span className="text-muted-foreground">File size limit:</span>
                    <span>10 MB per file</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-4">
                    Files are stored in Firebase Storage and linked to your account.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="bg-card rounded-lg border p-6">
              <FileList />
            </div>
          </div>
        </div>
      </div>
      
      {viewingFile && (
        <FileViewer 
          file={viewingFile} 
          open={isFileViewerOpen} 
          onOpenChange={setIsFileViewerOpen} 
        />
      )}
    </LayoutWrapper>
  );
}
