// Script temporaire pour créer un compte admin
import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, serverTimestamp } from "firebase/firestore";

// Configuration Firebase (même que dans .env)
const firebaseConfig = {
  apiKey: "AIzaSyDeb9oRVWZe8PeA8RaDxTfLY7YjvLmroQk",
  authDomain: "aftras-519e3.firebaseapp.com",
  projectId: "aftras-519e3",
  storageBucket: "aftras-519e3.firebasestorage.app",
  messagingSenderId: "992772777588",
  appId: "1:992772777588:web:1dd1cd112d53ffc81dd321"
};

// Initialiser Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

async function createAdminUser(email, password, name) {
  try {
    console.log("Création de l'utilisateur admin...");

    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    console.log("Utilisateur créé avec UID:", user.uid);

    // Créer le document dans Firestore
    await setDoc(doc(db, "users", user.uid), {
      name: name,
      email: email,
      role: "ADMIN",
      active: true,
      lastLogin: new Date().toISOString(),
      createdAt: serverTimestamp()
    });

    console.log("✅ Compte admin créé avec succès !");
    console.log("UID:", user.uid);
    console.log("Vous pouvez maintenant vous connecter via Google.");

  } catch (error) {
    console.error("❌ Erreur lors de la création:", error.message);

    if (error.code === 'auth/user-not-found') {
      console.log("💡 Utilisez plutôt Google Sign-In pour créer le compte, puis modifiez le rôle dans Firestore");
    }
  }
}

// Remplacer ces valeurs par les vôtres
const ADMIN_EMAIL = "votre.email@gmail.com";
const ADMIN_PASSWORD = "motdepasse123";
const ADMIN_NAME = "Votre Nom";

createAdminUser(ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_NAME);
