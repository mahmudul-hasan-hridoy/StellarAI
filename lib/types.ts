export interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: any;
  attachments?: string[];
}

export interface StoredFile {
  id: string;
  fileName: string;
  fileUrl?: string;
  fileType?: string;
  fileSize?: number;
  userId: string;
  uploadedAt: any;
  path: string;
}

export interface Chat {
  id: string;
  title: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
  isStarred?: boolean;
  messages: Message[];
  attachments?: StoredFile[];
}

// Extend the global namespace to include our auth token
declare global {
  var authToken: string | undefined;
  var currentUserId: string | undefined;
}

export {};