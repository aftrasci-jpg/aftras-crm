import { getFirestore, collection, addDoc, getDocs, doc, getDoc, query, where } from "firebase/firestore";
import { app } from "./firebaseConfig.js";

const db = getFirestore(app);

// Function to create a sale with commission calculation
async function createSale({ clientId, agentId, chiffreAffaires, montantReel, tauxCommission = 0.15 }) {
  try {
    // Validate that the client exists and belongs to the agent
    const clientRef = doc(db, "clients", clientId);
    const clientSnap = await getDoc(clientRef);
    if (!clientSnap.exists()) {
      throw new Error("Client not found");
    }
    const client = clientSnap.data();
    if (client.agentId !== agentId) {
      throw new Error("Client does not belong to the specified agent");
    }

    // Calculate benefice and commission
    const benefice = chiffreAffaires - montantReel;
    const commission = benefice * tauxCommission;

    const saleData = {
      clientId: clientId,
      agentId: agentId,
      chiffreAffaires: chiffreAffaires,
      montantReel: montantReel,
      benefice: benefice,
      tauxCommission: tauxCommission,
      commission: commission,
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, "sales"), saleData);
    console.log("Sale created successfully");
    return { success: true, id: docRef.id, commission: commission };
  } catch (error) {
    console.error("Error creating sale:", error);
    return { success: false, error: error.message };
  }
}

// Function to list all sales (for admin)
async function listAllSales() {
  try {
    const querySnapshot = await getDocs(collection(db, "sales"));
    const sales = [];
    querySnapshot.forEach((doc) => {
      sales.push({ id: doc.id, ...doc.data() });
    });
    console.log("All sales listed successfully");
    return { success: true, sales: sales };
  } catch (error) {
    console.error("Error listing all sales:", error);
    return { success: false, error: error.message };
  }
}

// Function to list sales for a specific agent
async function listSalesByAgent(agentId) {
  try {
    const salesQuery = query(collection(db, "sales"), where("agentId", "==", agentId));
    const querySnapshot = await getDocs(salesQuery);
    const sales = [];
    querySnapshot.forEach((doc) => {
      sales.push({ id: doc.id, ...doc.data() });
    });
    console.log("Sales listed successfully for agent");
    return { success: true, sales: sales };
  } catch (error) {
    console.error("Error listing sales by agent:", error);
    return { success: false, error: error.message };
  }
}

// Function to get a specific sale
async function getSale(saleId) {
  try {
    const docRef = doc(db, "sales", saleId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Sale retrieved successfully");
      return { success: true, sale: { id: docSnap.id, ...docSnap.data() } };
    } else {
      throw new Error("Sale not found");
    }
  } catch (error) {
    console.error("Error getting sale:", error);
    return { success: false, error: error.message };
  }
}

// Function to calculate total commissions for an agent
async function getTotalCommissionsByAgent(agentId) {
  try {
    const salesQuery = query(collection(db, "sales"), where("agentId", "==", agentId));
    const querySnapshot = await getDocs(salesQuery);
    let totalCommissions = 0;
    querySnapshot.forEach((doc) => {
      const sale = doc.data();
      totalCommissions += sale.commission;
    });
    console.log("Total commissions calculated for agent");
    return { success: true, totalCommissions: totalCommissions };
  } catch (error) {
    console.error("Error calculating total commissions:", error);
    return { success: false, error: error.message };
  }
}

export { createSale, listAllSales, listSalesByAgent, getSale, getTotalCommissionsByAgent };
