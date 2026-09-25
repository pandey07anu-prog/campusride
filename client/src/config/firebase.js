import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyCmStjP2J6xPxHq3PiyjkAAQTZYMf6PYzI",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "campus-ride-f0cae.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "campus-ride-f0cae",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "campus-ride-f0cae.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "52936300834",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:52936300834:web:07a9382be30dd9613c6d7b",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-H9TNVMRXN6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export default app;
