import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyAWnP4-CyqEFpzXjj526f-BGXK00d2GY_0",
  authDomain: "invoice-application-60796.firebaseapp.com",
  projectId: "invoice-application-60796",
  storageBucket: "invoice-application-60796.firebasestorage.app",
  messagingSenderId: "93167789526",
  appId: "1:93167789526:web:863fa73ab31d72b0047077",
  measurementId: "G-17HV9XFVXY"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();