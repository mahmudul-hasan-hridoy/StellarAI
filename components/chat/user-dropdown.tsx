"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, ChevronDown } from "lucide-react";
import Image from "next/image";

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
          className="justify-between items-center px-3 py-2 mt-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-700 text-white">
              {displayName.charAt(0).toUpperCase()}
            </div>
            <div className="truncate">
              <div className="font-medium truncate text-left">
                {displayName}
              </div>
              <div className="text-xs text-gray-400 truncate">{email}</div>
            </div>
          </div>
          <div className="opacity-60">
            <ChevronDown className="size-5" />
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-80 bg-[#121212] border border-gray-800 rounded-lg py-2 text-white overflow-hidden"
      >
        {/* User Info Section */}
        <div className="px-4 py-3">
          <div className="flex items-center mt-2 gap-3">
            <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-700">
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="Profile"
                  width={48}
                  height={48}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-lg font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div>
              <div className="font-semibold text-white">{displayName}</div>
              <div className="text-sm text-gray-400">{email}</div>
            </div>
          </div>
        </div>

        {/* Main Menu Items */}
        <DropdownMenuGroup className="px-2 py-1">
          <DropdownMenuItem
            className="flex items-center gap-3 py-2 px-3 cursor-pointer rounded-md hover:bg-[#2a2a2a]"
            onClick={handleSettings}
          >
            <Settings className="h-5 w-5 text-gray-400" />
            <span>Settings</span>
          </DropdownMenuItem>

          <DropdownMenuItem
            className="flex items-center gap-3 py-2 px-3 cursor-pointer rounded-md hover:bg-[#2a2a2a] text-red-400 hover:text-red-300"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
