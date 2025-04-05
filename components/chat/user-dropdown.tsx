
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
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { 
  User, 
  Settings, 
  LogOut, 
  CreditCard, 
  Users, 
  Moon, 
  Sun, 
  Monitor,
  ArrowRight,
  Home
} from "lucide-react";
import Image from "next/image";

export default function UserDropdown() {
  const { user, logOut } = useAuth();
  const router = useRouter();
  const [theme, setTheme] = useState<"system" | "light" | "dark">("dark");
  const [homepageVibe, setHomepageVibe] = useState(false);

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
        className="w-80 bg-[#121212] border border-gray-800 rounded-lg py-2 text-white overflow-hidden"
      >
        {/* User Info Section */}
        <div className="px-4 py-3">
          <div className="text-sm text-gray-400">{email}</div>
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
              <div className="text-sm text-gray-400">Free</div>
            </div>
          </div>
        </div>

        {/* Team Switch Button */}
        <div className="px-3 py-2">
          <Button 
            variant="outline" 
            className="w-full justify-center rounded-md bg-[#1e1e1e] hover:bg-[#2a2a2a] border-gray-700 text-white"
          >
            Switch Team
          </Button>
        </div>

        {/* Main Menu Items */}
        <DropdownMenuGroup className="px-2 py-1">
          <DropdownMenuItem className="flex items-center gap-3 py-2 px-3 cursor-pointer rounded-md hover:bg-[#2a2a2a]">
            <CreditCard className="h-5 w-5 text-gray-400" />
            <span>Billing</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-3 py-2 px-3 cursor-pointer rounded-md hover:bg-[#2a2a2a]"
            onClick={handleSettings}
          >
            <Settings className="h-5 w-5 text-gray-400" />
            <span>Settings</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem className="flex items-center gap-3 py-2 px-3 cursor-pointer rounded-md hover:bg-[#2a2a2a]">
            <Users className="h-5 w-5 text-gray-400" />
            <span>Discord</span>
          </DropdownMenuItem>
          
          <DropdownMenuItem 
            className="flex items-center gap-3 py-2 px-3 cursor-pointer rounded-md hover:bg-[#2a2a2a] text-red-400 hover:text-red-300"
            onClick={handleLogout}
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="bg-gray-800 my-2" />

        {/* Preferences Section */}
        <div className="px-4 py-2">
          <h3 className="text-sm text-gray-400 mb-2">Preferences</h3>
          
          {/* Theme Selection */}
          <div className="flex justify-between items-center py-2">
            <span>Theme</span>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                className={`p-2 h-8 w-8 rounded-md ${theme === 'system' ? 'bg-gray-700' : 'bg-[#1e1e1e]'} border-gray-700`}
                onClick={() => setTheme('system')}
              >
                <Monitor className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className={`p-2 h-8 w-8 rounded-md ${theme === 'light' ? 'bg-gray-700' : 'bg-[#1e1e1e]'} border-gray-700`}
                onClick={() => setTheme('light')}
              >
                <Sun className="h-4 w-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                className={`p-2 h-8 w-8 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-[#1e1e1e]'} border-gray-700`}
                onClick={() => setTheme('dark')}
              >
                <Moon className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          {/* Homepage Vibe Switch */}
          <div className="flex justify-between items-center py-2">
            <span>Homepage Vibe</span>
            <Switch 
              checked={homepageVibe}
              onCheckedChange={setHomepageVibe}
              className="data-[state=checked]:bg-gray-600"
            />
          </div>
          
          {/* Language Selector */}
          <div className="flex justify-between items-center py-2">
            <span>Language</span>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2 px-3 py-1 h-9 text-sm bg-[#1e1e1e] hover:bg-[#2a2a2a] border-gray-700 text-white"
            >
              English
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Upgrade Plan Button */}
        <div className="px-3 py-3 mt-2">
          <Button 
            className="w-full bg-white hover:bg-gray-200 text-black font-medium py-2"
          >
            Upgrade Plan
          </Button>
        </div>
        
        {/* Current User Status */}
        <div className="flex items-center gap-3 px-4 py-3 bg-[#1a1a1a] border-t border-gray-800">
          <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-700">
            {user?.photoURL ? (
              <Image
                src={user.photoURL}
                alt="Profile"
                width={40}
                height={40}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full flex items-center justify-center text-lg font-semibold">
                {displayName.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div>
            <div className="font-medium">{displayName}</div>
            <div className="text-sm text-gray-400">Free</div>
          </div>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
