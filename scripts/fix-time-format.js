import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs, updateDoc, doc } from "firebase/firestore";

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

/**
 * Normalize a time string:
 *  - "08h30 - 10h30" => "08:30-10:30"
 *  - "9:00-10:30"    => "09:00-10:30"
 *  - "10h30 - 12h00" => "10:30-12:00"
 */
function normalizeTime(time) {
  if (!time) return time;

  // Replace "h" with ":"
  let normalized = time.replace(/h/gi, ':');

  // Remove extra spaces around dash
  normalized = normalized.replace(/\s*-\s*/g, '-');

  // Pad each part: ensure HH:mm format
  const parts = normalized.split('-');
  const formatted = parts.map(part => {
    const trimmed = part.trim();
    const [h, m] = trimmed.split(':');
    const hh = h.padStart(2, '0');
    const mm = (m || '00').padStart(2, '0');
    return `${hh}:${mm}`;
  });

  return formatted.join('-');
}

async function fixTimeFormats() {
  console.log('Fetching all schedules from Firestore...');
  const snapshot = await getDocs(collection(db, 'schedules'));
  
  let updated = 0;
  let skipped = 0;

  for (const docSnap of snapshot.docs) {
    const data = docSnap.data();
    const original = data.time;
    
    if (!original) {
      skipped++;
      continue;
    }

    const normalized = normalizeTime(original);

    if (normalized !== original) {
      console.log(`  FIX: "${original}" => "${normalized}"  (doc: ${docSnap.id})`);
      await updateDoc(doc(db, 'schedules', docSnap.id), { time: normalized });
      updated++;
    } else {
      skipped++;
    }
  }

  console.log(`\nDone! Updated: ${updated}, Skipped (already correct): ${skipped}`);
  process.exit(0);
}

fixTimeFormats();
