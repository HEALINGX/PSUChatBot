import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDrj-_UDyVCcJYnxcjM7itQLz1XvNKfCWc",
  authDomain: "phejhabot.firebaseapp.com",
  projectId: "phejhabot",
  storageBucket: "phejhabot.firebasestorage.app",
  messagingSenderId: "596431317649",
  appId: "1:596431317649:web:c6fb7b34b86e43ad16ed30",
  measurementId: "G-J7RNFMW0BL"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export 'auth' เพื่อนำไปใช้ในหน้า Login
export const auth = getAuth(app);
export default app;