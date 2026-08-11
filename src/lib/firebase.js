import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

// Values for the calendar-pro-4f906 project's Web app. Overridable via
// .env so you can point this at a different project/app without editing
// code - see .env.example.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDb7sVE1j-0oM-gr_B_5Skc8o6oXkHUs8M",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "calendar-pro-4f906.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "calendar-pro-4f906",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "calendar-pro-4f906.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "277241764728",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:277241764728:web:2cc79f7addd4dffbe6068d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-DL1G8N38HS",
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// Analytics only works in a real browser (not during the build/SSR step),
// and Firebase's own isSupported() check keeps it from throwing in browsers
// that block it (e.g. some ad-blockers, Safari private mode).
isSupported().then((ok) => {
  if (ok) getAnalytics(app);
});

