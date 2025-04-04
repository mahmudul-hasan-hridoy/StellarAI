"use client";

import { useState, useEffect } from "react";
import { getUserFiles, deleteFileAndMetadata } from "@/lib/file-service";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  Trash2,
  ExternalLink,
  FileIcon,
  FileText,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { truncateFilename } from "@/lib/utils"; // Added import
import type { StoredFile } from "@/lib/types";

interface FileListProps {
  onSelectFile?: (file: StoredFile) => void;
  selectable?: boolean;
}

export function FileList({ onSelectFile, selectable = false }: FileListProps) {
  const { user } = useAuth();
  const [files, setFiles] = useState<StoredFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    fileId: string | null;
  }>({
    open: false,
    fileId: null,
  });
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      loadFiles();
    }
  }, [user]);

  const loadFiles = async () => {
    try {
      setLoading(true);
      if (!user) return;

      const userFiles = await getUserFiles(user.uid);
      setFiles(
        userFiles.sort(
          (a, b) => b.uploadedAt?.toMillis() - a.uploadedAt?.toMillis(),
        ),
      );
    } catch (error) {
      console.error("Error loading files:", error);
      toast({
        title: "Error loading files",
        description: "Could not load your files. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteFile = async () => {
    if (!deleteDialog.fileId) return;

    try {
      setDeleting(true);
      await deleteFileAndMetadata(deleteDialog.fileId);

      // Update the files list
      setFiles(files.filter((file) => file.id !== deleteDialog.fileId));

      toast({
        title: "File deleted",
        description: "The file has been deleted successfully.",
      });
    } catch (error) {
      console.error("Error deleting file:", error);
      toast({
        title: "Error deleting file",
        description: "Could not delete the file. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setDeleteDialog({ open: false, fileId: null });
    }
  };

  // Helper to format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B";
    else if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    else return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  // Helper to format date
  const formatDate = (timestamp: any) => {
    if (!timestamp) return "Unknown";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
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
    <div className="w-full max-w-full space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Your Files</h3>
        <Button
          variant="outline"
          size="sm"
          onClick={loadFiles}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : files.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <FileText className="h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">No files uploaded yet</p>
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden w-full">
          <div className="overflow-auto">
            {/* Desktop and tablet view */}
            <div className="hidden sm:block">
              <table className="border-collapse w-full">
                <thead>
                  <tr className="bg-secondary">
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      Type
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium">
                      Size
                    </th>
                    <th className="px-4 py-2 text-left text-sm font-medium hidden md:table-cell">
                      Uploaded
                    </th>
                    <th className="px-4 py-2 text-right text-sm font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {files.map((file) => (
                    <tr key={file.id} className="hover:bg-muted/50">
                      <td className="px-4 py-3 text-sm">
                        <div className="flex items-center gap-2">
                          <span>{getFileIcon(file.fileType ?? 'unknown')}</span>
                          <span
                            className="truncate max-w-[150px] md:max-w-[200px]"
                            title={file.fileName}
                          >
                            {truncateFilename(file.fileName)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {file.fileType?.split("/")[1] ?? file.fileType}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground">
                        {file.fileSize !== undefined ? formatFileSize(file.fileSize) : "N/A"}
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground hidden md:table-cell">
                        {formatDate(file.uploadedAt)}
                      </td>
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            asChild
                            className="h-8 w-8"
                          >
                            <a
                              href={file.fileUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>

                          {selectable && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => onSelectFile?.(file)}
                            >
                              Select
                            </Button>
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() =>
                              setDeleteDialog({ open: true, fileId: file.id })
                            }
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile view */}
            <div className="sm:hidden">
              {files.map((file) => (
                <div key={file.id} className="p-3 border-b hover:bg-muted/50">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span>{getFileIcon(file.fileType ?? 'unknown')}</span>
                      <span
                        className="font-medium truncate max-w-[180px]"
                        title={file.fileName}
                      >
                        {truncateFilename(file.fileName)}
                      </span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="icon"
                        asChild
                        className="h-7 w-7"
                      >
                        <a
                          href={file.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() =>
                          setDeleteDialog({ open: true, fileId: file.id })
                        }
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-1 text-xs text-muted-foreground">
                    <div>Type: {file.fileType?.split("/")[1] ?? file.fileType}</div>
                    <div>Size: {file.fileSize !== undefined ? formatFileSize(file.fileSize) : "N/A"}</div>
                  </div>
                  {selectable && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full mt-2 text-xs h-7"
                      onClick={() => onSelectFile?.(file)}
                    >
                      Select
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      <Dialog
        open={deleteDialog.open}
        onOpenChange={(open) => setDeleteDialog({ ...deleteDialog, open })}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete File</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this file? This action cannot be
              undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialog({ open: false, fileId: null })}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteFile}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
