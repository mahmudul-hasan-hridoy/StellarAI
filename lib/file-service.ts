import { db } from "./firebase";
import { uploadFile, deleteFile, listFiles } from "./firebase-storage";
import {
  collection,
  addDoc,
  deleteDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  doc,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import type { StoredFile } from "./types";

// Collection reference
const filesCollection = collection(db, "files");

// Generate a unique file path
const generateFilePath = (userId: string, fileName: string): string => {
  const timestamp = Date.now();
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.]/g, "_");
  return `uploads/${userId}/${timestamp}_${sanitizedFileName}`;
};

// Upload a file and save metadata to Firestore
export const uploadFileAndSaveMetadata = async (
  file: File,
  userId: string,
  onProgress?: (progress: number) => void,
): Promise<StoredFile> => {
  try {
    // Generate a path for the file
    const path = generateFilePath(userId, file.name);

    // Upload file to Firebase Storage
    const fileUrl = await uploadFile(file, path, onProgress);

    // Save file metadata to Firestore
    const fileData = {
      fileName: file.name,
      fileUrl,
      fileType: file.type,
      fileSize: file.size,
      userId,
      uploadedAt: serverTimestamp(),
      path,
    };

    const docRef = await addDoc(filesCollection, fileData);

    return {
      id: docRef.id,
      ...fileData,
    } as StoredFile;
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
};

// Delete a file from Storage and Firestore
export const deleteFileAndMetadata = async (fileId: string): Promise<void> => {
  try {
    // Get file reference
    const fileRef = doc(db, "files", fileId);

    // Get file metadata to get the storage path
    const fileSnap = await getDocs(
      query(filesCollection, where("id", "==", fileId)),
    );

    if (fileSnap.empty) {
      throw new Error("File not found");
    }

    const fileData = fileSnap.docs[0].data() as StoredFile;

    // Delete from Firebase Storage
    await deleteFile(fileData.path);

    // Delete from Firestore
    await deleteDoc(fileRef);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
};

// Get all files for a user
export const getUserFiles = async (userId: string): Promise<StoredFile[]> => {
  try {
    const q = query(filesCollection, where("userId", "==", userId));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as StoredFile[];
  } catch (error) {
    console.error("Error getting user files:", error);
    throw error;
  }
};

// Attach a file to a chat
export const attachFileToChat = async (
  chatId: string,
  fileId: string,
): Promise<void> => {
  try {
    const chatRef = doc(db, "chats", chatId);

    // Update the chat document to add the file ID to attachments array
    await updateDoc(chatRef, {
      attachments: arrayUnion(fileId),
    });
  } catch (error) {
    console.error("Error attaching file to chat:", error);
    throw error;
  }
};

// Get file metadata by ID
export const getFileById = async (
  fileId: string,
): Promise<StoredFile | null> => {
  if (!fileId || typeof fileId !== 'string') {
    console.error("Invalid file ID provided:", fileId);
    return null;
  }

  try {
    console.log(`Fetching file with ID: ${fileId}`);
    
    // First try querying with the ID field
    let q = query(filesCollection, where("id", "==", fileId));
    let querySnapshot = await getDocs(q);

    // If not found, try querying with the document ID
    if (querySnapshot.empty) {
      console.log(`No file found with id field equal to ${fileId}, trying document ID`);
      try {
        const docRef = doc(db, "files", fileId);
        const docSnap = await getDocs(query(collection(db, "files"), where("__name__", "==", fileId)));
        
        if (!docSnap.empty) {
          console.log(`File found with document ID: ${fileId}`);
          return {
            id: docSnap.docs[0].id,
            ...docSnap.docs[0].data(),
          } as StoredFile;
        }
      } catch (err) {
        console.error(`Error getting document with ID ${fileId}:`, err);
      }
      
      console.error(`File not found: ${fileId}`);
      return null;
    }

    if (!querySnapshot.docs[0]) {
      console.error(`Query snapshot has no documents for ${fileId}`);
      return null;
    }

    const fileData = {
      id: querySnapshot.docs[0].id,
      ...querySnapshot.docs[0].data(),
    } as StoredFile;
    
    console.log(`File retrieved: ${fileData.fileName}`);
    return fileData;
  } catch (error) {
    console.error(`Error getting file ${fileId}:`, error);
    throw error;
  }
};
