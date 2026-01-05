// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBFZ1HkkwgPYW8G9NoSxzAGIfrEfsXspso",
  authDomain: "gescats-b61dc.firebaseapp.com",
  projectId: "gescats-b61dc",
  storageBucket: "gescats-b61dc.firebasestorage.app",
  messagingSenderId: "148530873224",
  appId: "1:148530873224:web:e769c9b3a9ee52f813303d",
  measurementId: "G-HKTCME787Y"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
// const analytics = getAnalytics(app);

export { app };
