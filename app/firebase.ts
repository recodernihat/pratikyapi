import { initializeApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAGb3_h1Jn5xYi2QVYFJXm6SaIs-cnCiH0",
  authDomain: "pratikya-89f6a.firebaseapp.com",
  projectId: "pratikya-89f6a",
  storageBucket: "pratikya-89f6a.firebasestorage.app",
  messagingSenderId: "117950734836",
  appId: "1:117950734836:web:0125c869516e914056d9a1",
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
export const db = getFirestore(app);