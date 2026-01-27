import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where,
  addDoc,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase-config';

export const dbService = {
  getAll: async <T>(collectionName: string): Promise<T[]> => {
    try {
      const querySnapshot = await getDocs(collection(db, collectionName));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error: any) {
      if (error?.code !== 'unavailable' && error?.code !== 'permission-denied') {
        console.error(`Erreur collection ${collectionName}:`, error);
      }
      return []; 
    }
  },

  getById: async <T>(collectionName: string, id: string): Promise<T | null> => {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() } as T) : null;
    } catch (error: any) {
      if (error?.code === 'permission-denied' && id === 'app_config') {
        return null;
      }
      if (error?.code !== 'unavailable') {
        console.error(`Erreur document ${id}:`, error);
      }
      return null;
    }
  },

  listenById: <T>(collectionName: string, id: string, callback: (data: T | null) => void) => {
    const docRef = doc(db, collectionName, id);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({ id: docSnap.id, ...docSnap.data() } as T);
      } else {
        callback(null);
      }
    }, (error) => {
      if (error.code !== 'permission-denied') {
        console.error(`Erreur écoute document ${id}:`, error);
      }
      callback(null);
    });
  },

  add: async <T>(collectionName: string, data: Omit<T, 'id'>): Promise<T> => {
    try {
      const docRef = await addDoc(collection(db, collectionName), data as any);
      return { id: docRef.id, ...data } as T;
    } catch (error) {
      console.error(`Erreur ajout ${collectionName}:`, error);
      throw error;
    }
  },

  update: async <T>(collectionName: string, id: string, data: Partial<T>): Promise<void> => {
    try {
      const docRef = doc(db, collectionName, id);
      return await updateDoc(docRef, data);
    } catch (error) {
      console.error(`Erreur mise à jour ${id}:`, error);
      throw error;
    }
  },

  delete: async (collectionName: string, id: string): Promise<void> => {
    try {
      return await deleteDoc(doc(db, collectionName, id));
    } catch (error) {
      console.error(`Erreur suppression ${id}:`, error);
      throw error;
    }
  },

  getByQuery: async <T>(collectionName: string, field: string, operator: any, value: any): Promise<T[]> => {
    try {
      const q = query(collection(db, collectionName), where(field, operator, value));
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as T));
    } catch (error: any) {
      if (error?.code !== 'unavailable' && error?.code !== 'permission-denied') {
        console.error(`Erreur requête ${collectionName}:`, error);
      }
      return [];
    }
  }
};
