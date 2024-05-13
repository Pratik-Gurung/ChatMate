import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: "reactchat-eaeb1.firebaseapp.com",
  projectId: "reactchat-eaeb1",
  storageBucket: "reactchat-eaeb1.appspot.com",
  messagingSenderId: "234134240126",
  appId: "1:234134240126:web:f2c1fb94e99f368029112f"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth()
export const db = getFirestore()
export const storage = getStorage()
