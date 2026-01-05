// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBe5BS-CDK-5HW-XxJtMtQI49nzaPlRZdw",
  authDomain: "aftrasc-7d0b5.firebaseapp.com",
  projectId: "aftrasc-7d0b5",
  storageBucket: "aftrasc-7d0b5.firebasestorage.app",
  messagingSenderId: "1031829827614",
  appId: "1:1031829827614:web:d3cdc3795a191cb3c47e0f",
  measurementId: "G-HR8NLK3FQX"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
