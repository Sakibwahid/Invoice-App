import { useQuery } from "@tanstack/react-query";
import { getQuotations } from "../services/quotationService";

const QUOTATIONS_QUERY_KEY = ["quotations"];
const QUOTATIONS_STALE_TIME = 5 * 60 * 1000; // 5 minutes

export const useQuotations = (options = {}) => {
  return useQuery({
    queryKey: QUOTATIONS_QUERY_KEY,
    queryFn: getQuotations,
    staleTime: QUOTATIONS_STALE_TIME,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: "stale",
    retry: 1,
    ...options,
  });
};
