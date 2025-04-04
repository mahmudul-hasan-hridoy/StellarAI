"use client";

import type React from "react";

import { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import {
  PlusCircle,
  MessageSquare,
  Trash2,
  Loader2,
  Star,
  Search,
  Settings,
  FileIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { useChat } from "@/contexts/chat-context";
import type { Chat } from "@/lib/types";

export default function ChatSidebar() {
  const [searchQuery, setSearchQuery] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  const { chats, loading, deleteChat, toggleStar } = useChat();
  const router = useRouter();
  const pathname = usePathname();

  const handleNewChat = () => {
    router.push("/chat/new");
  };

  const handleDeleteChat = async (chatId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!confirm("Are you sure you want to delete this chat?")) {
      return;
    }

    try {
      setDeleting(chatId);
      await deleteChat(chatId);

      // If we're currently viewing this chat, redirect to new chat
      if (pathname === `/chat/${chatId}`) {
        router.push("/chat/new");
      }
    } catch (error) {
      console.error("Error deleting chat:", error);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleStar = async (
    chatId: string,
    isStarred: boolean,
    e: React.MouseEvent,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await toggleStar(chatId, isStarred);
    } catch (error) {
      console.error("Error updating star status:", error);
    }
  };

  const filteredChats = searchQuery
    ? chats.filter((chat) =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()),
      )
    : chats;

  const starredChats = filteredChats.filter((chat) => chat.isStarred);
  const regularChats = filteredChats.filter((chat) => !chat.isStarred);

  return (
    <div className="flex flex-col h-full py-2">
      <div className="px-3 mb-2">
        <Button
          onClick={handleNewChat}
          className="w-full justify-start gap-2 bg-gray-800 hover:bg-gray-700 text-white border-0"
        >
          <PlusCircle className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      <div className="px-3 mb-2">
        <div className="relative">
          <Search className="absolute left-2 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <Input
            placeholder="Search chats..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 bg-gray-800 border-gray-700 text-white"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-1">
        {loading ? (
          <div className="flex items-center justify-center h-20">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
          </div>
        ) : filteredChats.length === 0 ? (
          <div className="text-center p-4 text-gray-400">
            <p>No chat history yet</p>
            <p className="text-sm">Start a new conversation</p>
          </div>
        ) : (
          <>
            {starredChats.length > 0 && (
              <div className="mb-2">
                <div className="px-3 py-1 text-xs font-medium text-gray-400">
                  Starred Chats
                </div>
                <ul className="space-y-1">
                  {starredChats.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={pathname === `/chat/${chat.id}`}
                      onDelete={handleDeleteChat}
                      onToggleStar={handleToggleStar}
                      isDeleting={deleting === chat.id}
                    />
                  ))}
                </ul>
              </div>
            )}

            {regularChats.length > 0 && (
              <div>
                {starredChats.length > 0 && (
                  <>
                    <Separator className="my-2 bg-gray-800" />
                    <div className="px-3 py-1 text-xs font-medium text-gray-400">
                      All Chats
                    </div>
                  </>
                )}
                <ul className="space-y-1">
                  {regularChats.map((chat) => (
                    <ChatItem
                      key={chat.id}
                      chat={chat}
                      isActive={pathname === `/chat/${chat.id}`}
                      onDelete={handleDeleteChat}
                      onToggleStar={handleToggleStar}
                      isDeleting={deleting === chat.id}
                    />
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>

      <div className="mt-auto pt-2 px-3">
        <Link
          href="/files"
          className={cn(
            "group flex items-center px-2 py-2 text-sm font-medium rounded-md hover:bg-secondary",
            pathname === "/files" && "bg-secondary"
          )}
        >
          <FileIcon className="mr-3 h-4 w-4" />
          Files
        </Link>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-start gap-2 text-gray-400 hover:text-white hover:bg-gray-800"
        >
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>
    </div>
  );
}

interface ChatItemProps {
  chat: Chat;
  isActive: boolean;
  isDeleting: boolean;
  onDelete: (chatId: string, e: React.MouseEvent) => Promise<void>;
  onToggleStar: (
    chatId: string,
    isStarred: boolean,
    e: React.MouseEvent,
  ) => Promise<void>;
}

function ChatItem({
  chat,
  isActive,
  isDeleting,
  onDelete,
  onToggleStar,
}: ChatItemProps) {
  return (
    <li className="group">
      <Link
        href={`/chat/${chat.id}`}
        className={cn(
          "flex items-center justify-between px-3 py-2 rounded-md hover:bg-gray-800/50 transition-colors",
          isActive ? "bg-secondary text-white" : "text-gray-300",
        )}
      >
        <div className="flex items-center gap-2 overflow-hidden">
          <MessageSquare className="h-4 w-4 shrink-0 text-gray-400" />
          <span className="truncate">{chat.title}</span>
        </div>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => onToggleStar(chat.id, !!chat.isStarred, e)}
            className={cn(
              "h-7 w-7 rounded-md p-1 hover:bg-gray-700 transition-colors",
              chat.isStarred ? "text-yellow-500 opacity-100" : "text-gray-400",
            )}
          >
            <Star className="h-full w-full" />
          </button>
          <button
            onClick={(e) => onDelete(chat.id, e)}
            className="h-7 w-7 rounded-md p-1 hover:bg-gray-700 transition-colors text-gray-400 hover:text-red-500"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <Loader2 className="h-full w-full animate-spin" />
            ) : (
              <Trash2 className="h-full w-full" />
            )}
          </button>
        </div>
      </Link>
    </li>
  );
}