export const safeNumber = (value) => {
  const num = Number(value);

  return Number.isFinite(num) ? num : 0;
};