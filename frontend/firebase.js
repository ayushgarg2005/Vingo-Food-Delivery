// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "food-delivery-930f3.firebaseapp.com",
  projectId: "food-delivery-930f3",
  storageBucket: "food-delivery-930f3.firebasestorage.app",
  messagingSenderId: "34981287560",
  appId: "1:34981287560:web:e32c806da1b135237c713d"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export {app, auth};