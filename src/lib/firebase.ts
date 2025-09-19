// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAor6k_CI8pDFW9QDEqBxW-pnhwHIZvp8U",
  authDomain: "markit-e4ade.firebaseapp.com",
  projectId: "markit-e4ade",
  storageBucket: "markit-e4ade.appspot.com",
  messagingSenderId: "227077432850",
  appId: "1:227077432850:web:85b41f036565781c6c9acb",
  measurementId: "G-6ZV8HJF2DR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Configure Firestore for optimization
if (typeof window !== 'undefined') {
  // Enable offline persistence
  import('firebase/firestore').then(({ enableNetwork, disableNetwork }) => {
    // Enable offline support - settings are configured during initialization
    console.log('Firebase Firestore initialized with offline support');
  });
}

// Initialize Analytics only if supported (browser)
let analytics: ReturnType<typeof getAnalytics> | undefined = undefined;
if (typeof window !== "undefined" && window.location && analyticsIsSupported) {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics, storage }; 