import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyD7dztnerFG6q0CZlHFwdkxjcfkBuRuaLI",
    authDomain: "todoappfirebase-bf55a.firebaseapp.com",
    projectId: "todoappfirebase-bf55a",
    storageBucket: "todoappfirebase-bf55a.firebasestorage.app",
    messagingSenderId: "383288513527",
    appId: "1:383288513527:web:27f9e131b0bdb44b5f14f2"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };