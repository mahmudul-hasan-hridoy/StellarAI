import { auth, db } from "@/lib/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  updateProfile,
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { cookies } from "next/headers";

// Helper to set the auth cookie
export const setAuthCookie = (token: string) => {
  cookies().set({
    name: "firebase-auth-token",
    value: token,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 5, // 5 days
    path: "/",
  });
};

// Helper to clear the auth cookie
export const clearAuthCookie = () => {
  cookies().delete("firebase-auth-token");
};

// Sign up a new user and create their profile
export const signUpUser = async (
  email: string,
  password: string,
  displayName: string,
) => {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Update profile with display name
    await updateProfile(user, { displayName });

    // Create user document in Firestore
    await setDoc(doc(db, "users", user.uid), {
      uid: user.uid,
      email: user.email,
      displayName,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    // Set auth cookie
    const token = await user.getIdToken();
    setAuthCookie(token);

    return user;
  } catch (error) {
    console.error("Error signing up user:", error);
    throw error;
  }
};

// Sign in an existing user
export const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;

    // Set auth cookie
    const token = await user.getIdToken();
    setAuthCookie(token);

    return user;
  } catch (error) {
    console.error("Error signing in user:", error);
    throw error;
  }
};

// Sign out a user
export const signOutUser = async () => {
  try {
    await firebaseSignOut(auth);
    clearAuthCookie();
  } catch (error) {
    console.error("Error signing out user:", error);
    throw error;
  }
};

// Send password reset email
export const resetUserPassword = async (email: string) => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    console.error("Error sending password reset email:", error);
    throw error;
  }
};
