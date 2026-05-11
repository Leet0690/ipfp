import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, deleteDoc, doc } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAG7CiN3A1ZaVDU21AFaFHTwi38CnDs-do",
  authDomain: "ipfp-4802c.firebaseapp.com",
  projectId: "ipfp-4802c",
  storageBucket: "ipfp-4802c.firebasestorage.app",
  messagingSenderId: "623262953318",
  appId: "1:623262953318:web:7b91cfbaadf810de5f22a7",
  measurementId: "G-LD4GH0PPK7"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function cleanupDuplicates() {
  console.log("Démarrage du nettoyage des doublons...");
  
  try {
    const snapshot = await getDocs(collection(db, 'students'));
    const students = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    
    console.log(`Total des stagiaires trouvés : ${students.length}`);
    
    const seen = new Set();
    const toDelete = [];
    
    for (const s of students) {
      const nameKey = `${(s.firstName || '').toLowerCase().trim()}_${(s.lastName || '').toLowerCase().trim()}`;
      const key = s.regNo ? s.regNo.trim() : nameKey;
      
      if (!key || key === '_') continue; // Skip empty documents to be safe

      if (seen.has(key)) {
        toDelete.push(s);
      } else {
        seen.add(key);
      }
    }
    
    console.log(`Doublons identifiés : ${toDelete.length}`);
    
    let deletedCount = 0;
    for (const s of toDelete) {
      await deleteDoc(doc(db, 'students', s.id));
      deletedCount++;
      console.log(`Supprimé : ${s.firstName} ${s.lastName} (ID: ${s.id})`);
    }
    
    console.log(`✅ Nettoyage terminé ! ${deletedCount} doublons ont été supprimés.`);
    process.exit(0);
  } catch (error) {
    console.error("Erreur lors du nettoyage :", error);
    process.exit(1);
  }
}

cleanupDuplicates();
