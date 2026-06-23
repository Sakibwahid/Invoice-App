import {
  collection,
  doc,
  getDocs,
  getDoc,
  query,
  orderBy,
  limit,
  setDoc,
  serverTimestamp,
  where,
} from "firebase/firestore";

import { db } from "../firebase/firebase.config";

const generateInvoiceNumber = async () => {
  const year = new Date().getFullYear().toString().slice(-2);

  const q = query(
    collection(db, "invoices"),
    orderBy("invoiceNumber", "desc"),
    limit(1),
  );

  const snapshot = await getDocs(q);

  let nextNumber = 1;

  if (!snapshot.empty) {
    const lastInvoice = snapshot.docs[0].data();

    const match = lastInvoice.invoiceNumber?.match(/INV-(\d+)-/);

    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  return `INV-${String(nextNumber).padStart(3, "0")}-${year}`;
};

export const createInvoice = async (invoiceData) => {
  const invoiceNumber = await generateInvoiceNumber();

  const invoiceRef = doc(collection(db, "invoices"));

  const payload = {
    ...invoiceData,

    invoiceId: invoiceRef.id,

    invoiceNumber,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(invoiceRef, payload);

  return payload;
};

// Fetch all invoices (with caching via React Query)
export const getInvoices = async () => {
  const q = query(
    collection(db, "invoices"),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Fetch invoices with pagination (Firebase doesn't support offset, so we fetch all then slice)
export const getInvoicesPaginated = async (pageNum = 0, pageSize = 20) => {
  const allInvoices = await getInvoices();
  const start = pageNum * pageSize;
  return allInvoices.slice(start, start + pageSize);
};

// Fetch invoices by status
export const getInvoicesByStatus = async (status) => {
  const q = query(
    collection(db, "invoices"),
    where("status", "==", status),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

// Fetch single invoice
export const getInvoiceById = async (id) => {
  const ref = doc(db, "invoices", id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

// Search invoices by client name or invoice number
export const searchInvoices = async (searchTerm) => {
  const q = query(
    collection(db, "invoices"),
    orderBy("invoiceNumber"),
  );

  const snapshot = await getDocs(q);

  const results = snapshot.docs.filter((doc) => {
    const data = doc.data();
    const term = searchTerm.toLowerCase();

    return (
      data.invoiceNumber?.toLowerCase().includes(term) ||
      data.client?.name?.toLowerCase().includes(term) ||
      data.client?.company?.toLowerCase().includes(term)
    );
  });

  return results.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

