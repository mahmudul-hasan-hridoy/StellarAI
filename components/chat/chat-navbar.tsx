"use client";

import { X, PanelRightOpen, PanelRight } from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { useChat } from "@/contexts/chat-context";
import { useEffect } from "react";
import { getChat } from "@/lib/chat-service";
import { useAuth } from "@/contexts/auth-context";

export default function ChatNavbar() {
  const { toggleSidebar } = useSidebar();
  const router = useRouter();
  const params = useParams();
  const { currentChat, setCurrentChat } = useChat();
  const { user } = useAuth();

  // Load the current chat when the component mounts or params change
  useEffect(() => {
    const loadCurrentChat = async () => {
      // If we're on a specific chat page
      if (params?.id && typeof params.id === "string" && user) {
        try {
          const chatData = await getChat(params.id);
          if (chatData) {
            setCurrentChat(chatData);
          }
        } catch (error) {
          console.error("Error loading chat:", error);
        }
      } else if (!params?.id || params.id === "new") {
        // If we're on the new chat page
        setCurrentChat(null);
      }
    };

    loadCurrentChat();
  }, [params?.id, setCurrentChat, user]);

  return (
    <div className="flex items-center justify-between p-3 border-b border-gray-800 bg-[#121212] sticky top-0 left-0 right-0 z-30 backdrop-blur-md bg-opacity-90">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleSidebar}
          className="md:flex text-gray-400 hover:text-white"
        >
          <PanelRight size={20} />
        </Button>

        <div className="max-w-[200px] md:max-w-md truncate">
          <h1 className="text-lg font-medium">
            {currentChat?.title || "New Chat"}
          </h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Additional buttons can go here */}
      </div>
    </div>
  );
}
