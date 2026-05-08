import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDbHTDjWNbskpZ8rDcws5qwRvh-BM2RKgQ",
  authDomain: "linguabridge-2574f.firebaseapp.com",
  projectId: "linguabridge-2574f",
  storageBucket: "linguabridge-2574f.firebasestorage.app",
  messagingSenderId: "640116284028",
  appId: "1:640116284028:web:06a1747abc8db8db20c7f9",
  measurementId: "G-38356JXJDQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);