"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from "react";
import { useAuth } from "@/contexts/auth-context";
import {
  getUserChats,
  deleteChat,
  starChat,
  unstarChat,
  type Chat,
} from "@/lib/chat-service";
import { useToast } from "@/hooks/use-toast";

interface ChatContextType {
  chats: Chat[];
  loading: boolean;
  refreshChats: () => Promise<void>;
  deleteChat: (chatId: string) => Promise<void>;
  toggleStar: (chatId: string, isStarred: boolean) => Promise<void>;
  currentChat: Chat | null;
  setCurrentChat: (chat: Chat | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentChat, setCurrentChat] = useState<Chat | null>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const refreshChats = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const userChats = await getUserChats(user.uid);
      setChats(userChats);
    } catch (error) {
      console.error("Error loading chats:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load chat history",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    try {
      await deleteChat(chatId);
      setChats(chats.filter((chat) => chat.id !== chatId));
      toast({
        title: "Success",
        description: "Chat deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to delete chat",
      });
      throw error;
    }
  };

  const handleToggleStar = async (chatId: string, isStarred: boolean) => {
    try {
      if (isStarred) {
        await unstarChat(chatId);
      } else {
        await starChat(chatId);
      }

      // Update local state
      setChats(
        chats.map((chat) =>
          chat.id === chatId ? { ...chat, isStarred: !isStarred } : chat,
        ),
      );

      toast({
        title: "Success",
        description: isStarred
          ? "Chat removed from starred"
          : "Chat added to starred",
      });
    } catch (error) {
      console.error("Error updating star status:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update star status",
      });
      throw error;
    }
  };

  // Load chats only once when the user changes
  useEffect(() => {
    if (user) {
      refreshChats();
    } else {
      setChats([]);
      setLoading(false);
    }
  }, [user]);

  return (
    <ChatContext.Provider
      value={{
        chats,
        loading,
        refreshChats,
        deleteChat: handleDeleteChat,
        toggleStar: handleToggleStar,
        currentChat,
        setCurrentChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
}
