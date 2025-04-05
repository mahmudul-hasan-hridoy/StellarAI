
"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import {
  type User,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  updateProfile,
  sendPasswordResetEmail,
} from "firebase/auth"
import { auth } from "@/lib/firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  signUp: (email: string, password: string, displayName: string) => Promise<void>
  signIn: (email: string, password: string) => Promise<User>
  logOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  updateUserProfile: (displayName: string, photoURL?: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signUp: async () => {},
  signIn: async () => { throw new Error("Not implemented") },
  logOut: async () => {},
  resetPassword: async () => {},
  updateUserProfile: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, displayName: string) => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    // Generate avatar URL based on user ID
    const avatarUrl = `https://avatar.vercel.sh/${userCredential.user.uid}`
    await updateProfile(userCredential.user, { 
      displayName,
      photoURL: avatarUrl
    })
  }

  const signIn = async (email: string, password: string): Promise<User> => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Get the ID token and store it in a cookie for server-side authentication
      const token = await user.getIdToken();
      document.cookie = `firebase-auth-token=${token}; path=/; max-age=${60 * 60 * 24 * 5}; SameSite=Strict; ${window.location.protocol === 'https:' ? 'Secure;' : ''}`;
      
      return user;
    } catch (error) {
      console.error("Sign in error:", error);
      throw error;
    }
  }

  const logOut = async () => {
    try {
      await signOut(auth);
      // Clear the auth cookie
      document.cookie = "firebase-auth-token=; path=/; max-age=0; SameSite=Strict";
    } catch (error) {
      console.error("Sign out error:", error);
      throw error;
    }
  }

  const resetPassword = async (email: string) => {
    await sendPasswordResetEmail(auth, email)
  }

  const updateUserProfile = async (displayName: string, photoURL?: string) => {
    if (auth.currentUser) {
      // If photoURL is not provided, keep existing one or generate from user ID
      const avatarUrl = photoURL || auth.currentUser.photoURL || `https://avatar.vercel.sh/${auth.currentUser.uid}`
      await updateProfile(auth.currentUser, { 
        displayName,
        photoURL: avatarUrl
      })
      // Force refresh the user state
      setUser({ ...auth.currentUser })
    }
  }

  const value: AuthContextType = {
    user,
    loading,
    signUp,
    signIn,
    logOut,
    resetPassword,
    updateUserProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
