export const formatCurrency = (amount: number): string => {
  return `KES ${Math.abs(amount).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}; 