import { createContext, useContext, useEffect, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "../lib/firebase";

const AuthContext = createContext(null);

// Only these Google accounts are allowed to use the admin site. Add more
// emails here (comma-separated in .env) if more than one person needs access.
const ALLOWED_ADMIN_EMAILS = (
  import.meta.env.VITE_ADMIN_EMAILS || "myexcelweb@gmail.com"
)
  .split(",")
  .map((e) => e.trim().toLowerCase())
  .filter(Boolean);

function isAllowedAdmin(user) {
  return user.emailVerified && ALLOWED_ADMIN_EMAILS.includes(user.email?.toLowerCase());
}

const googleProvider = new GoogleAuthProvider();
// Always show the account chooser instead of silently reusing the last
// Google session, so it's obvious which account is signing in.
googleProvider.setCustomParameters({ prompt: "select_account" });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    // A non-admin account is signed straight back out and never reaches the admin screens
    // (also covers a session restored on reload). The Firestore rules enforce the same check
    const unsub = onAuthStateChanged(auth, (u) => {
      if (u && !isAllowedAdmin(u)) {
        setAuthError(`${u.email || "This account"} isn't an authorized admin account for this site.`);
        setUser(null);
        signOut(auth);
        return;
      }
      setUser(u);
    });
    return unsub;
  }, []);

  const loginWithGoogle = async () => {
    setAuthError("");
    await signInWithPopup(auth, googleProvider);
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, loginWithGoogle, logout, authError }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
