import { getFirestore, collection, addDoc, Timestamp } from "firebase/firestore";
import { app } from "../firebaseConfig.js";

const db = getFirestore(app);

async function createAuthorizedAdmin() {
  try {
    await addDoc(collection(db, "authorized_admin"), {
      email: "aftrasci@gmail.com",
      role: "admin",
      active: true,
      createdAt: Timestamp.now()
    });
    console.log("Admin authorized created successfully");
  } catch (e) {
    console.error("Error adding admin authorized: ", e);
  }
}

createAuthorizedAdmin();
