import { getFirestore, collection, doc, updateDoc, deleteDoc, getDocs, query, where } from "firebase/firestore";
import { app } from "./firebaseConfig.js";

const db = getFirestore(app);

// Function to activate an agent
async function activateAgent(agentId) {
  try {
    const agentRef = doc(db, "agents", agentId);
    await updateDoc(agentRef, {
      status: "active"
    });
    console.log("Agent activated successfully");
    return { success: true };
  } catch (error) {
    console.error("Error activating agent:", error);
    return { success: false, error: error.message };
  }
}

// Function to deactivate an agent
async function deactivateAgent(agentId) {
  try {
    const agentRef = doc(db, "agents", agentId);
    await updateDoc(agentRef, {
      status: "inactive"
    });
    console.log("Agent deactivated successfully");
    return { success: true };
  } catch (error) {
    console.error("Error deactivating agent:", error);
    return { success: false, error: error.message };
  }
}

// Function to delete an agent
async function deleteAgent(agentId) {
  try {
    await deleteDoc(doc(db, "agents", agentId));
    console.log("Agent deleted successfully");
    return { success: true };
  } catch (error) {
    console.error("Error deleting agent:", error);
    return { success: false, error: error.message };
  }
}

// Function to list all agents
async function listAgents() {
  try {
    const agentsQuery = query(collection(db, "agents"));
    const querySnapshot = await getDocs(agentsQuery);
    const agents = [];
    querySnapshot.forEach((doc) => {
      agents.push({ id: doc.id, ...doc.data() });
    });
    console.log("Agents listed successfully");
    return { success: true, agents: agents };
  } catch (error) {
    console.error("Error listing agents:", error);
    return { success: false, error: error.message };
  }
}

export { activateAgent, deactivateAgent, deleteAgent, listAgents };
