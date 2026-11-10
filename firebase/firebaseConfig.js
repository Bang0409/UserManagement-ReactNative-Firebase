
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyC2GfthFnG5hyujxca7Mh9t3zZvabZyNYI",
  authDomain: "usermanagement-4de9d.firebaseapp.com",
  projectId: "usermanagement-4de9d",
  storageBucket: "usermanagement-4de9d.firebasestorage.app",
  messagingSenderId: "226601509895",
  appId: "1:226601509895:web:98dff2f07da09e323936a2"
};

// Khởi tạo Firebase
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Kết nối Cloud Firestore
export const db = getFirestore(app);

// Firebase Authentication
export const auth = getAuth(app);

export default app;
