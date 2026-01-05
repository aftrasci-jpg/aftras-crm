import { getFirestore, collection, addDoc, getDocs, doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { app } from "./firebaseConfig.js";

const db = getFirestore(app);

// Function to create a new prospection form
async function createProspectionForm({ title, fields }) {
  try {
    // Validate fields structure
    const validTypes = ['text', 'email', 'number', 'select', 'checkbox', 'textarea'];
    for (const field of fields) {
      if (!validTypes.includes(field.type)) {
        throw new Error(`Invalid field type: ${field.type}`);
      }
      if (field.type === 'select' && (!field.options || !Array.isArray(field.options))) {
        throw new Error('Select fields must have options array');
      }
    }

    const formData = {
      title: title,
      fields: fields,
      createdAt: new Date(),
      createdBy: 'admin' // Assuming admin creates
    };

    const docRef = await addDoc(collection(db, "prospection_forms"), formData);
    console.log("Prospection form created successfully");
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error creating prospection form:", error);
    return { success: false, error: error.message };
  }
}

// Function to list all prospection forms (read-only for agents)
async function listProspectionForms() {
  try {
    const querySnapshot = await getDocs(collection(db, "prospection_forms"));
    const forms = [];
    querySnapshot.forEach((doc) => {
      forms.push({ id: doc.id, ...doc.data() });
    });
    console.log("Prospection forms listed successfully");
    return { success: true, forms: forms };
  } catch (error) {
    console.error("Error listing prospection forms:", error);
    return { success: false, error: error.message };
  }
}

// Function to get a specific prospection form
async function getProspectionForm(formId) {
  try {
    const docRef = doc(db, "prospection_forms", formId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      console.log("Prospection form retrieved successfully");
      return { success: true, form: { id: docSnap.id, ...docSnap.data() } };
    } else {
      throw new Error("Form not found");
    }
  } catch (error) {
    console.error("Error getting prospection form:", error);
    return { success: false, error: error.message };
  }
}

// Function to update a prospection form (admin only)
async function updateProspectionForm(formId, updates) {
  try {
    const docRef = doc(db, "prospection_forms", formId);
    await updateDoc(docRef, updates);
    console.log("Prospection form updated successfully");
    return { success: true };
  } catch (error) {
    console.error("Error updating prospection form:", error);
    return { success: false, error: error.message };
  }
}

// Function to delete a prospection form (admin only)
async function deleteProspectionForm(formId) {
  try {
    await deleteDoc(doc(db, "prospection_forms", formId));
    console.log("Prospection form deleted successfully");
    return { success: true };
  } catch (error) {
    console.error("Error deleting prospection form:", error);
    return { success: false, error: error.message };
  }
}

export { createProspectionForm, listProspectionForms, getProspectionForm, updateProspectionForm, deleteProspectionForm };
