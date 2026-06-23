import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/firebase.config";

const SETTINGS_DOC = doc(db, "settings", "companySettings");

export const getSettings = async () => {
  const snapshot = await getDoc(SETTINGS_DOC);
  if (!snapshot.exists()) return null;
  return snapshot.data();
};

export const saveSettings = async (settingsData) => {
  await setDoc(SETTINGS_DOC, {
    ...settingsData,
    updatedAt: serverTimestamp(),
  });
};