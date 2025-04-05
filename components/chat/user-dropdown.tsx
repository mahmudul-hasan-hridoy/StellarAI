"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { User, Settings, LogOut, HelpCircle } from "lucide-react";

export default function UserDropdown() {
  const { user, logOut } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      await logOut();
      router.push("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const handleSettings = () => {
    router.push("/profile");
  };

  const displayName = user?.displayName || user?.email?.split("@")[0] || "User";
  const email = user?.email || "";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="w-full justify-between items-center px-3 py-2 mt-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-700 text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="font-medium truncate">{displayName}</div>
              <div className="text-xs text-gray-400 truncate">{email}</div>
            </div>
          </div>
          <div className="opacity-60">▼</div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-56 bg-gray-900 border-gray-800 text-white"
      >
        <DropdownMenuLabel className="text-gray-400">
          My Account
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-gray-800" />
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-800"
          onClick={handleSettings}
        >
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="flex items-center gap-2 cursor-pointer hover:bg-gray-800"
          onClick={() => router.push("/about")}
        >
          <HelpCircle className="h-4 w-4" />
          <span>Help & Support</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator className="bg-gray-800" />
        <DropdownMenuItem
          className="flex items-center gap-2 text-red-400 cursor-pointer hover:bg-gray-800 hover:text-red-300"
          onClick={handleLogout}
        >
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
