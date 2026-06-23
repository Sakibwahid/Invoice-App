import { useInfiniteQuery } from "@tanstack/react-query";
import { getInvoicesPaginated } from "../services/invoiceService";

const INVOICES_INFINITE_QUERY_KEY = ["invoices", "infinite"];
export const ITEMS_PER_PAGE = 20;

export const useInvoicesInfinite = (options = {}) => {
  return useInfiniteQuery({
    queryKey: INVOICES_INFINITE_QUERY_KEY,
    queryFn: ({ pageParam = 0 }) =>
      getInvoicesPaginated(pageParam, ITEMS_PER_PAGE),
    getNextPageParam: (lastPage, allPages) => {
      return lastPage.length === ITEMS_PER_PAGE
        ? allPages.length
        : undefined;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    initialPageParam: 0,
    ...options,
  });
};
