"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { User, Mail, AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function Profile() {
  const { user, loading, updateUserProfile, logOut } = useAuth()
  const [displayName, setDisplayName] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const router = useRouter()
  const { toast } = useToast()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login")
    } else if (user) {
      setDisplayName(user.displayName || "")
    }
  }, [user, loading, router])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSuccess(false)
    setIsUpdating(true)

    try {
      await updateUserProfile(displayName)
      setSuccess(true)
      toast({
        title: "Success",
        description: "Your profile has been updated successfully.",
      })
    } catch (error: any) {
      setError(error.message || "Failed to update profile")
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update profile",
      })
    } finally {
      setIsUpdating(false)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      await logOut()
      router.push("/")
      toast({
        title: "Success",
        description: "You have been logged out successfully.",
      })
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to log out",
      })
    } finally {
      setIsLoggingOut(false)
    }
  }

  if (loading || !user) {
    return (
      <div className="flex flex-col min-h-[calc(100vh-4rem)] py-12">
        <div className="container-custom flex flex-col items-center justify-center flex-1">
          <div className="text-center space-y-4">
            <div className="relative h-12 w-12 mx-auto">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="h-10 w-10 rounded-full bg-primary/20 animate-pulse"></div>
              </div>
            </div>
            <p className="text-muted-foreground">Loading profile...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] py-12">
      <div className="container-custom flex flex-col items-center justify-center flex-1">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center">
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="h-14 w-14 rounded-full bg-primary/20"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center">
                  {user.photoURL ? (
                    <img
                      src={user.photoURL || "/placeholder.svg"}
                      alt={user.displayName || "User"}
                      className="h-12 w-12 rounded-full object-cover"
                    />
                  ) : (
                    <User className="h-8 w-8 text-primary" />
                  )}
                </div>
              </div>
            </div>
            <h1 className="text-3xl font-bold">Your Profile</h1>
            <p className="text-muted-foreground">Manage your account settings</p>
          </div>

          {error && (
            <div className="bg-destructive/10 text-destructive p-3 rounded-md flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 text-green-500 p-3 rounded-md flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              <p className="text-sm">Profile updated successfully.</p>
            </div>
          )}

          <div className="card p-6 space-y-6">
            <div className="space-y-2">
              <p className="text-sm font-medium">Email</p>
              <div className="flex items-center gap-2 p-2 rounded-md bg-muted">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <p>{user.email}</p>
              </div>
              <p className="text-xs text-muted-foreground">
                {user.emailVerified ? "Email verified" : "Email not verified"}
              </p>
            </div>

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="space-y-2">
                <label htmlFor="displayName" className="text-sm font-medium">
                  Display Name
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <User className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <input
                    id="displayName"
                    name="displayName"
                    type="text"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    className="input-field pl-10"
                    placeholder="Your name"
                  />
                </div>
              </div>

              <button type="submit" disabled={isUpdating} className="btn btn-primary w-full">
                {isUpdating ? "Updating..." : "Update Profile"}
              </button>
            </form>

            <div className="pt-4 border-t border-border">
              <button onClick={handleLogout} disabled={isLoggingOut} className="btn btn-secondary w-full">
                {isLoggingOut ? "Logging out..." : "Sign out"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

