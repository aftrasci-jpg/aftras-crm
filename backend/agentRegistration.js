import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getFirestore, collection, addDoc, doc, getDoc, Timestamp } from "firebase/firestore";
import { app } from "./firebaseConfig.js";

const auth = getAuth(app);
const db = getFirestore(app);

// Function to register a new agent
async function registerAgent({ nom, prenom, email, password, activationCode }) {
  try {
    // Verify activation code
    const activationDoc = await getDoc(doc(db, "activation_codes", activationCode));
    if (!activationDoc.exists()) {
      throw new Error("Invalid activation code");
    }

    // Create Firebase Auth user
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const uid = userCredential.user.uid;

    // Create agent document in Firestore
    await addDoc(collection(db, "agents"), {
      uid: uid,
      nom: nom,
      prenom: prenom,
      email: email,
      status: "inactive",
      createdAt: Timestamp.now(),
      lastLogin: null
    });

    console.log("Agent registered successfully");
    return { success: true, uid: uid };
  } catch (error) {
    console.error("Error registering agent:", error);
    return { success: false, error: error.message };
  }
}

export { registerAgent };
