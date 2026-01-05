import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { app } from "./firebaseConfig.js";

const db = getFirestore(app);

// Function to create a new prospect (linked to a form)
async function createProspect({ agentId, formId, data }) {
  try {
    // Validate that the form exists
    const formRef = doc(db, "prospection_forms", formId);
    const formSnap = await getDoc(formRef);
    if (!formSnap.exists()) {
      throw new Error("Form not found");
    }

    const prospectData = {
      agentId: agentId,
      formId: formId,
      data: data,
      status: "en_cours",
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, "prospects"), prospectData);
    console.log("Prospect created successfully");
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating prospect:", error);
    return { success: false, error: error.message };
  }
}

// Function to list prospects for a specific agent (agent can only see their own)
async function listProspectsByAgent(agentId) {
  try {
    const prospectsQuery = query(collection(db, "prospects"), where("agentId", "==", agentId));
    const querySnapshot = await getDocs(prospectsQuery);
    const prospects = [];
    querySnapshot.forEach((doc) => {
      prospects.push({ id: doc.id, ...doc.data() });
    });
    console.log("Prospects listed successfully for agent");
    return { success: true, prospects: prospects };
  } catch (error) {
    console.error("Error listing prospects:", error);
    return { success: false, error: error.message };
  }
}

// Function to get a specific prospect (only if belongs to the agent)
async function getProspect(prospectId, agentId) {
  try {
    const docRef = doc(db, "prospects", prospectId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const prospect = { id: docSnap.id, ...docSnap.data() };
      if (prospect.agentId !== agentId) {
        throw new Error("Unauthorized access to prospect");
      }
      console.log("Prospect retrieved successfully");
      return { success: true, prospect: prospect };
    } else {
      throw new Error("Prospect not found");
    }
  } catch (error) {
    console.error("Error getting prospect:", error);
    return { success: false, error: error.message };
  }
}

// Function to update a prospect (only by the owning agent)
async function updateProspect(prospectId, agentId, updates) {
  try {
    const docRef = doc(db, "prospects", prospectId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Prospect not found");
    }
    const prospect = docSnap.data();
    if (prospect.agentId !== agentId) {
      throw new Error("Unauthorized update of prospect");
    }
    await updateDoc(docRef, updates);
    console.log("Prospect updated successfully");
    return { success: true };
  } catch (error) {
    console.error("Error updating prospect:", error);
    return { success: false, error: error.message };
  }
}

// Function to delete a prospect (only by the owning agent)
async function deleteProspect(prospectId, agentId) {
  try {
    const docRef = doc(db, "prospects", prospectId);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) {
      throw new Error("Prospect not found");
    }
    const prospect = docSnap.data();
    if (prospect.agentId !== agentId) {
      throw new Error("Unauthorized deletion of prospect");
    }
    await deleteDoc(docRef);
    console.log("Prospect deleted successfully");
    return { success: true };
  } catch (error) {
    console.error("Error deleting prospect:", error);
    return { success: false, error: error.message };
  }
}

export { createProspect, listProspectsByAgent, getProspect, updateProspect, deleteProspect };
