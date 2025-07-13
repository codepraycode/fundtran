export const generateAccountNumber = (): string => {
  // Generate 10-digit account number
  const randomNum = Math.floor(1000000000 + Math.random() * 9000000000);
  return randomNum.toString();
};