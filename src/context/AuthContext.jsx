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

const googleProvider = new GoogleAuthProvider();
// Always show the account chooser instead of silently reusing the last
// Google session, so it's obvious which account is signing in.
googleProvider.setCustomParameters({ prompt: "select_account" });

export function AuthProvider({ children }) {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return unsub;
  }, []);

  const loginWithGoogle = async () => {
    setAuthError("");
    const result = await signInWithPopup(auth, googleProvider);
    const email = result.user.email?.toLowerCase();
    if (!ALLOWED_ADMIN_EMAILS.includes(email)) {
      await signOut(auth);
      setAuthError(
        `${result.user.email} isn't an authorized admin account for this site.`
      );
    }
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
