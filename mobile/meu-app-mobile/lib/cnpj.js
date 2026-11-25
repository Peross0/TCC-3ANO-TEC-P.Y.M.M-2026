export function isValidCnpj(value) {
  const digits = value.toUpperCase().replace(/[.\/\-\s]/g, '');
  if (!/^[A-Z0-9]{12}\d{2}$/.test(digits) || /^(\d)\1{13}$/.test(digits)) return false;
  const numbers = Array.from(digits, (character) => character.charCodeAt(0) - 48);
  const digit = (weights) => {
    const sum = weights.reduce((total, weight, index) => total + numbers[index] * weight, 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  return numbers[12] === digit([5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]) &&
    numbers[13] === digit([6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
}