"use client"

import type React from "react"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { ChatProvider } from "@/contexts/chat-context"
import ChatSidebar from "@/components/chat/chat-sidebar"
import ChatNavbar from "@/components/chat/chat-navbar"
import { Sidebar, SidebarContent, SidebarProvider } from "@/components/ui/sidebar"

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-background">
        <div className="animate-pulse text-center">
          <div className="relative h-12 w-12 mx-auto">
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-10 w-10 rounded-full bg-primary/20"></div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="h-8 w-8 text-primary" fill="currentColor">
                <path d="M12 1L15.5 8.5L23 9.5L17.5 15L19 23L12 19L5 23L6.5 15L1 9.5L8.5 8.5L12 1Z" />
              </svg>
            </div>
          </div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <ChatProvider>
      <div className="h-screen w-screen bg-[#1a1a1a] overflow-hidden">
        <SidebarProvider>
          <div className="flex h-full w-full">
            <Sidebar variant="inset" className="border-r border-gray-800 z-30">
              <SidebarContent>
                <ChatSidebar />
              </SidebarContent>
            </Sidebar>
            <div className="flex flex-col w-full h-full overflow-hidden">
              <div className="sticky top-0 left-0 right-0 z-30 bg-[#1a1a1a] border-b border-gray-800 bg-opacity-90 backdrop-blur-md">
                <ChatNavbar />
              </div>
              <main className="flex-1 relative overflow-hidden">{children}</main>
            </div>
          </div>
        </SidebarProvider>
      </div>
    </ChatProvider>
  )
}

