import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore, enableIndexedDbPersistence } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyA0Ln-5mM1NL1t3H67SzPG8PvjsIAm6hrE",
  authDomain: "codewithhridoy-f71.firebaseapp.com",
  databaseURL: "https://codewithhridoy-f71-default-rtdb.firebaseio.com",
  projectId: "codewithhridoy-f71",
  storageBucket: "codewithhridoy-f71.appspot.com",
  messagingSenderId: "577591601346",
  appId: "1:577591601346:web:8ca28fae59e22b5888f35b",
  measurementId: "G-2LH46QS94P",
};

// Initialize Firebase - ensure it's only initialized once
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Initialize services after app is initialized
const auth = getAuth(app);
const db = getFirestore(app);

// Enable offline persistence when possible
if (typeof window !== "undefined") {
  enableIndexedDbPersistence(db).catch((err) => {
    console.error("Firestore persistence error:", err);
  });
}

export { app, auth, db };
