import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getSettings } from "../services/settingsService";

const SETTINGS_QUERY_KEY = ["settings"];

export const useSettings = (options = {}) => {
  return useQuery({
    queryKey: SETTINGS_QUERY_KEY,
    queryFn: getSettings,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    ...options,
  });
};

export const useSettingsRefetch = () => {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: SETTINGS_QUERY_KEY });
};