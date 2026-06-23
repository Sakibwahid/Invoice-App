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
  updateDoc,
} from "firebase/firestore";

import { db } from "../firebase/firebase.config";

const generateQuotationNumber = async () => {
  const year = new Date().getFullYear().toString().slice(-2);

  const q = query(
    collection(db, "quotations"),
    orderBy("quotationNumber", "desc"),
    limit(1),
  );

  const snapshot = await getDocs(q);

  let nextNumber = 1;

  if (!snapshot.empty) {
    const lastQuotation = snapshot.docs[0].data();

    const match = lastQuotation.quotationNumber?.match(/QT-(\d+)-/);

    if (match) {
      nextNumber = Number(match[1]) + 1;
    }
  }

  return `QT-${String(nextNumber).padStart(3, "0")}-${year}`;
};

export const createQuotation = async (quotationData) => {
  const quotationNumber = await generateQuotationNumber();

  const quotationRef = doc(collection(db, "quotations"));

  const payload = {
    ...quotationData,

    quotationId: quotationRef.id,

    quotationNumber,

    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  await setDoc(quotationRef, payload);

  return payload;
};

export const getQuotations = async () => {
  const q = query(
    collection(db, "quotations"),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const getQuotationsPaginated = async (pageNum = 0, pageSize = 20) => {
  const allQuotations = await getQuotations();
  const start = pageNum * pageSize;
  return allQuotations.slice(start, start + pageSize);
};

export const getQuotationById = async (id) => {
  const ref = doc(db, "quotations", id);
  const snapshot = await getDoc(ref);

  if (!snapshot.exists()) return null;

  return {
    id: snapshot.id,
    ...snapshot.data(),
  };
};

export const getQuotationsByStatus = async (status) => {
  const q = query(
    collection(db, "quotations"),
    where("status", "==", status),
    orderBy("createdAt", "desc"),
  );

  const snapshot = await getDocs(q);

  return snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const searchQuotations = async (searchTerm) => {
  const q = query(
    collection(db, "quotations"),
    orderBy("quotationNumber"),
  );

  const snapshot = await getDocs(q);

  const results = snapshot.docs.filter((doc) => {
    const data = doc.data();
    const term = searchTerm.toLowerCase();

    return (
      data.quotationNumber?.toLowerCase().includes(term) ||
      data.client?.name?.toLowerCase().includes(term) ||
      data.client?.company?.toLowerCase().includes(term)
    );
  });

  return results.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  }));
};

export const convertQuotationToInvoice = async (quotationId) => {
  const quotation = await getQuotationById(quotationId);

  if (!quotation) throw new Error("Quotation not found");

  const { createInvoice } = await import("./invoiceService");

  const invoiceData = {
    ...quotation,
    status: "Unpaid",
    quotationId,
  };

  return createInvoice(invoiceData);
};

export const updateQuotationStatus = async (quotationId, status) => {
  const ref = doc(db, "quotations", quotationId);
  await updateDoc(ref, {
    status,
    updatedAt: serverTimestamp(),
  });
};
