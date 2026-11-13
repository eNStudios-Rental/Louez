const nipWeights = [6, 5, 7, 2, 3, 4, 5, 6, 7] as const;

export const isValidPolishNip = (value: string): boolean => {
  const normalized = value.replace(/[\s-]/g, "");
  if (!/^\d{10}$/.test(normalized)) return false;

  const checksum = nipWeights.reduce(
    (sum, weight, index) => sum + weight * Number(normalized[index]),
    0,
  );
  const checkDigit = checksum % 11;

  return checkDigit !== 10 && checkDigit === Number(normalized[9]);
};
