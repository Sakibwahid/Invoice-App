import { safeNumber } from "./safeNumber";

export const formatCurrency = (value, currency = "AED") => {
  return `${currency} ${safeNumber(value).toLocaleString(
    undefined,
    {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  )}`;
};