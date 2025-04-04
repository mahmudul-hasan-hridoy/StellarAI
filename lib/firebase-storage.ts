import {
  getStorage,
  ref,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  listAll,
} from "firebase/storage";
import { app } from "./firebase";

// Initialize Firebase Storage
const storage = getStorage(app);

// Upload file to Firebase Storage
export const uploadFile = async (
  file: File,
  path: string,
  onProgress?: (progress: number) => void,
): Promise<string> => {
  return new Promise((resolve, reject) => {
    // Create storage reference
    const storageRef = ref(storage, path);

    // Create upload task
    const uploadTask = uploadBytesResumable(storageRef, file);

    // Listen for upload events
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Calculate and report progress
        const progress =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        if (onProgress) onProgress(progress);
      },
      (error) => {
        // Handle errors
        console.error("Upload failed:", error);
        reject(error);
      },
      async () => {
        // Upload completed successfully, get download URL
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadURL);
      },
    );
  });
};

// Delete file from Firebase Storage
export const deleteFile = async (path: string): Promise<void> => {
  const fileRef = ref(storage, path);
  return deleteObject(fileRef);
};

// List all files in a directory
export const listFiles = async (
  path: string,
): Promise<{ name: string; url: string }[]> => {
  const directoryRef = ref(storage, path);
  const fileList = await listAll(directoryRef);

  // Get download URLs for all files
  const files = await Promise.all(
    fileList.items.map(async (itemRef) => {
      const url = await getDownloadURL(itemRef);
      return {
        name: itemRef.name,
        url,
      };
    }),
  );

  return files;
};

export { storage };
