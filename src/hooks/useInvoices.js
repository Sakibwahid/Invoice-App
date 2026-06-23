import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getInvoices } from "../services/invoiceService";

const INVOICES_QUERY_KEY = ["invoices"];
const INVOICES_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useInvoices = (options = {}) => {
  return useQuery({
    queryKey: INVOICES_QUERY_KEY,
    queryFn: getInvoices,
    staleTime: INVOICES_STALE_TIME,
    gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
    refetchOnWindowFocus: "stale",
    retry: 1,
    ...options,
  });
};

export const useInvoicesRefetch = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: INVOICES_QUERY_KEY });
};
