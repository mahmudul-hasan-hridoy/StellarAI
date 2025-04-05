import { db, auth } from "@/lib/firebase"; // Assuming auth is initialized elsewhere
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  deleteDoc,
} from "firebase/firestore";

export interface Message {
  id?: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  attachments?: any[]; // Added attachments field
}

export interface Chat {
  id: string;
  title: string;
  userId: string;
  createdAt: any;
  updatedAt: any;
  isStarred?: boolean;
  messages: Message[];
}

export const createChat = async (
  userId: string,
  initialMessage: string,
  attachments: string[] = []
): Promise<string> => {
  try {
    // Create chat document
    const chatRef = await addDoc(collection(db, "chats"), {
      userId,
      title: initialMessage.substring(0, 30) + (initialMessage.length > 30 ? "..." : ""),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      isStarred: false,
    });

    // Create first message in subcollection
    await addDoc(collection(db, "chats", chatRef.id, "messages"), {
      role: "user",
      content: initialMessage || "",
      timestamp: serverTimestamp(),
      ...(attachments.length > 0 && { attachments })
    });

    return chatRef.id;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

export const getChat = async (chatId: string): Promise<Chat | null> => {
  try {
    // First, verify the chat exists and belongs to the user
    const chatRef = doc(db, "chats", chatId);
    const chatDoc = await getDoc(chatRef);

    if (!chatDoc.exists()) {
      throw new Error(`Chat with ID ${chatId} does not exist`);
    }

    // Verify chat belongs to the current user
    if (chatDoc.data().userId !== auth.currentUser?.uid) {
      throw new Error(
        `Unauthorized: You don't have permission to access this chat`,
      );
    }

    const chatData = chatDoc.data();

    // Fixed: Use the correct subcollection path for messages
    const messagesQuery = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "asc"),
    );

    const messagesSnapshot = await getDocs(messagesQuery);
    const messages: Message[] = messagesSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Message, "id">),
    }));

    return {
      id: chatDoc.id,
      ...chatData,
      messages,
    } as Chat;
  } catch (error) {
    console.error("Error getting chat:", error);
    throw error;
  }
};

export const getUserChats = async (userId: string): Promise<Chat[]> => {
  try {
    // Add authentication check: Only allow access if the user is authenticated and the userId matches
    if (!auth.currentUser || auth.currentUser.uid !== userId) {
      throw new Error("Unauthorized access to user chats.");
    }

    const chatsQuery = query(
      collection(db, "chats"),
      where("userId", "==", userId),
      orderBy("updatedAt", "desc"),
    );

    const chatsSnapshot = await getDocs(chatsQuery);

    const chats: Chat[] = [];

    for (const chatDoc of chatsSnapshot.docs) {
      const chatData = chatDoc.data();

      chats.push({
        id: chatDoc.id,
        title: chatData.title,
        userId: chatData.userId,
        createdAt: chatData.createdAt,
        updatedAt: chatData.updatedAt,
        isStarred: chatData.isStarred || false,
        messages: [], // Don't load messages for the chat list to improve performance
      });
    }

    return chats;
  } catch (error) {
    console.error("Error getting user chats:", error);
    throw error;
  }
};

export async function addMessage(
  chatId: string, 
  message: Omit<Message, "id"> | Omit<Message, "id" | "timestamp">
) {
  try {
    // Add message to messages subcollection
    const messagesRef = collection(db, "chats", chatId, "messages");
    
    // Handle both timestamp formats (string from client or missing entirely)
    const messageData = {
      ...message,
      // Check if timestamp exists in the message object before accessing it
      timestamp: 'timestamp' in message ? message.timestamp : serverTimestamp(),
      // Include attachments if present
      ...(message.attachments && { attachments: message.attachments }),
    };

    console.log(`Adding message to chat ${chatId}:`, 
      { role: messageData.role, contentLength: messageData.content?.length || 0 });
    
    const docRef = await addDoc(messagesRef, messageData);
    
    // Update the chat's updatedAt field
    const chatRef = doc(db, "chats", chatId);
    await updateDoc(chatRef, {
      updatedAt: serverTimestamp(),
    });
    
    return docRef.id;
  } catch (error) {
    console.error("Error adding message:", error);
    throw error;
  }
}

export const deleteChat = async (chatId: string): Promise<void> => {
  try {
    // Add authentication check: User must be authenticated to delete a chat
    if (!auth.currentUser) {
      throw new Error("Unauthorized: You must be logged in to delete a chat.");
    }

    // Delete all messages in the chat
    const messagesQuery = query(
      collection(db, "messages"),
      where("chatId", "==", chatId),
    );

    const messagesSnapshot = await getDocs(messagesQuery);

    const deletePromises = messagesSnapshot.docs.map((doc) =>
      deleteDoc(doc.ref),
    );

    await Promise.all(deletePromises);

    // Delete the chat document
    await deleteDoc(doc(db, "chats", chatId));
  } catch (error) {
    console.error("Error deleting chat:", error);
    throw error;
  }
};

export const updateChatTitle = async (
  chatId: string,
  title: string,
): Promise<void> => {
  try {
    // Add authentication check: User must be authenticated to update a chat title
    if (!auth.currentUser) {
      throw new Error(
        "Unauthorized: You must be logged in to update a chat title.",
      );
    }
    await updateDoc(doc(db, "chats", chatId), {
      title,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating chat title:", error);
    throw error;
  }
};

// Add the missing updateChatStar function (renamed from starChat/unstarChat)
export const updateChatStar = async (
  chatId: string,
  isStarred: boolean,
): Promise<void> => {
  try {
    // Add authentication check: User must be authenticated to update star status
    if (!auth.currentUser) {
      throw new Error(
        "Unauthorized: You must be logged in to update star status.",
      );
    }
    await updateDoc(doc(db, "chats", chatId), {
      isStarred,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating star status:", error);
    throw error;
  }
};

// Keep these for backward compatibility
export const starChat = async (chatId: string): Promise<void> => {
  return updateChatStar(chatId, true);
};

export const unstarChat = async (chatId: string): Promise<void> => {
  return updateChatStar(chatId, false);
};