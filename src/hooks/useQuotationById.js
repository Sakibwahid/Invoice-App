import { useQuery } from "@tanstack/react-query";
import { getQuotationById } from "../services/quotationService";

const QUOTATION_QUERY_KEY = (id) => ["quotation", id];
const QUOTATION_STALE_TIME = 10 * 60 * 1000; // 10 minutes

export const useQuotationById = (id, options = {}) => {
  return useQuery({
    queryKey: QUOTATION_QUERY_KEY(id),
    queryFn: () => getQuotationById(id),
    enabled: !!id,
    staleTime: QUOTATION_STALE_TIME,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    ...options,
  });
};
