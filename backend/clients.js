import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc, query, where } from "firebase/firestore";
import { app } from "./firebaseConfig.js";

const db = getFirestore(app);

// Function to convert a prospect to a client
async function convertProspectToClient(prospectId, agentId) {
  try {
    // Get the prospect
    const prospectRef = doc(db, "prospects", prospectId);
    const prospectSnap = await getDoc(prospectRef);
    if (!prospectSnap.exists()) {
      throw new Error("Prospect not found");
    }
    const prospect = prospectSnap.data();

    // Verify the prospect belongs to the agent
    if (prospect.agentId !== agentId) {
      throw new Error("Unauthorized conversion of prospect");
    }

    // Create the client document
    const clientData = {
      agentId: agentId,
      data: prospect.data,
      confirmedAt: new Date()
    };

    const clientDocRef = await addDoc(collection(db, "clients"), clientData);

    // Delete the prospect
    await deleteDoc(prospectRef);

    console.log("Prospect converted to client successfully");
    return { success: true, clientId: clientDocRef.id };
  } catch (error) {
    console.error("Error converting prospect to client:", error);
    return { success: false, error: error.message };
  }
}

// Function to list clients for a specific agent
async function listClientsByAgent(agentId) {
  try {
    const clientsQuery = query(collection(db, "clients"), where("agentId", "==", agentId));
    const querySnapshot = await getDocs(clientsQuery);
    const clients = [];
    querySnapshot.forEach((doc) => {
      clients.push({ id: doc.id, ...doc.data() });
    });
    console.log("Clients listed successfully for agent");
    return { success: true, clients: clients };
  } catch (error) {
    console.error("Error listing clients:", error);
    return { success: false, error: error.message };
  }
}

// Function to list all clients (for admin)
async function listAllClients() {
  try {
    const querySnapshot = await getDocs(collection(db, "clients"));
    const clients = [];
    querySnapshot.forEach((doc) => {
      clients.push({ id: doc.id, ...doc.data() });
    });
    console.log("All clients listed successfully");
    return { success: true, clients: clients };
  } catch (error) {
    console.error("Error listing all clients:", error);
    return { success: false, error: error.message };
  }
}

// Function to get a specific client
async function getClient(clientId) {
  try {
    const docRef = doc(db, "clients", clientId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Client retrieved successfully");
      return { success: true, client: { id: docSnap.id, ...docSnap.data() } };
    } else {
      throw new Error("Client not found");
    }
  } catch (error) {
    console.error("Error getting client:", error);
    return { success: false, error: error.message };
  }
}

export { convertProspectToClient, listClientsByAgent, listAllClients, getClient };
