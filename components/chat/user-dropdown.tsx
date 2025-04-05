
"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Settings, LogOut, ChevronDown, CreditCard, FileIcon, Moon, Sun } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";

export default function UserDropdown() {
  const { user, logOut } = useAuth();
  const router = useRouter();
  const [theme, setTheme] = useState("dark");
  
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
          className="justify-between items-center w-full px-3 py-2 mt-2 text-sm text-gray-300 hover:bg-gray-800 rounded-md"
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <div className="flex items-center justify-center h-8 w-8 rounded-full bg-gray-700 text-white overflow-hidden">
              {user?.photoURL ? (
                <Image
                  src={user.photoURL}
                  alt="Profile"
                  width={40}
                  height={40}
                  className="h-full w-full object-cover"
                />
              ) : (
                displayName.charAt(0).toUpperCase()
              )}
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
              <div className="text-xs mt-1 text-gray-500">Free</div>
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-800 my-1" />

        {/* Main Menu Items */}
        <DropdownMenuGroup className="px-2 py-1">
          <DropdownMenuItem
            className="flex items-center gap-3 py-2 px-3 cursor-pointer rounded-md hover:bg-[#2a2a2a]"
            onClick={handleSettings}
          >
            <Settings className="h-5 w-5 text-gray-400" />
            <span>Settings</span>
          </DropdownMenuItem>

          <Link href="/files" passHref>
            <DropdownMenuItem
              className="flex items-center gap-3 py-2 px-3 cursor-pointer rounded-md hover:bg-[#2a2a2a]"
            >
              <FileIcon className="h-5 w-5 text-gray-400" />
              <span>Files</span>
            </DropdownMenuItem>
          </Link>

          <Link href="/pricing" passHref>
            <DropdownMenuItem
              className="flex items-center gap-3 py-2 px-3 cursor-pointer rounded-md hover:bg-[#2a2a2a]"
            >
              <CreditCard className="h-5 w-5 text-gray-400" />
              <span>Billing</span>
            </DropdownMenuItem>
          </Link>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-gray-800 my-1" />

        {/* Preferences */}
        <div className="px-3 py-2">
          <h4 className="text-xs font-medium text-gray-500 mb-2">Preferences</h4>
          
          <div className="flex items-center justify-between py-1">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon className="h-5 w-5 text-gray-400" />
              ) : (
                <Sun className="h-5 w-5 text-gray-400" />
              )}
              <span className="text-sm">Theme</span>
            </div>
            <div className="flex space-x-2 items-center">
              <span className="text-xs text-gray-400">
                {theme === "dark" ? "Dark" : "Light"}
              </span>
              <Switch 
                checked={theme === "dark"}
                onCheckedChange={(checked) => setTheme(checked ? "dark" : "light")}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </div>

        <DropdownMenuSeparator className="bg-gray-800 my-1" />

        <DropdownMenuItem
          className="flex items-center gap-3 py-2 px-3 cursor-pointer rounded-md hover:bg-[#2a2a2a] text-red-400 hover:text-red-300 mx-2"
          onClick={handleLogout}
        >
          <LogOut className="h-5 w-5" />
          <span>Sign Out</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
