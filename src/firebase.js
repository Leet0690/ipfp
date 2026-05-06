import { initializeApp } from "firebase/app";
import { 
  initializeFirestore, 
  getFirestore,
  persistentLocalCache, 
  persistentMultipleTabManager,
  CACHE_SIZE_UNLIMITED 
} from "firebase/firestore";

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

let _db;
try {
  _db = initializeFirestore(app, {
    localCache: persistentLocalCache({
      tabManager: persistentMultipleTabManager(),
      cacheSizeBytes: CACHE_SIZE_UNLIMITED
    })
  });
} catch (e) {
  console.warn("Firestore cache initialization failed:", e);
  _db = getFirestore(app);
}

export const db = _db;
