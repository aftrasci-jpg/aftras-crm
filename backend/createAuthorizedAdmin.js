import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { app } from "./firebaseConfig.js";

const db = getFirestore(app);

async function createAuthorizedAdmin() {
  try {
    await addDoc(collection(db, "authorized_admin"), {
      email: "aftrasci@gmail.com",
      role: "admin",
      active: true,
      createdAt: Timestamp.now()
    });
    console.log("Authorized admin created successfully");
  } catch (error) {
    console.error("Error creating authorized admin:", error);
  }
}

createAuthorizedAdmin();
