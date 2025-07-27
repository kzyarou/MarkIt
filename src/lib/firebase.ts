// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported as analyticsIsSupported } from "firebase/analytics";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCHDUwZoOd2ikAwwM64BTpI0C0QuReq7q0",
  authDomain: "zupp-1800b.firebaseapp.com",
  databaseURL: "https://zupp-1800b-default-rtdb.firebaseio.com",
  projectId: "zupp-1800b",
  storageBucket: "zupp-1800b.appspot.com",
  messagingSenderId: "110927391637",
  appId: "1:110927391637:web:af1ec46b0c1fa955e2a49c",
  measurementId: "G-90VS2YJQHE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Initialize Analytics only if supported (browser)
let analytics: ReturnType<typeof getAnalytics> | undefined = undefined;
if (typeof window !== "undefined" && window.location && analyticsIsSupported) {
  analytics = getAnalytics(app);
}

export { app, auth, db, analytics, storage }; 