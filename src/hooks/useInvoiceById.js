import { useQuery } from "@tanstack/react-query";
import { getInvoiceById } from "../services/invoiceService";

const INVOICE_QUERY_KEY = (id) => ["invoice", id];
const INVOICE_STALE_TIME = 10 * 60 * 1000; // 10 minutes

export const useInvoiceById = (id, options = {}) => {
  return useQuery({
    queryKey: INVOICE_QUERY_KEY(id),
    queryFn: () => getInvoiceById(id),
    enabled: !!id,
    staleTime: INVOICE_STALE_TIME,
    gcTime: 15 * 60 * 1000, // 15 minutes (formerly cacheTime)
    retry: 1,
    ...options,
  });
};
