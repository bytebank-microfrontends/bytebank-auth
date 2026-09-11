export function onlyDigits(value: string): string {
  return value.replace(/\D/g, "");
}

export function isValidCpf(value: string): boolean {
  const digits = onlyDigits(value);

  if (digits.length !== 11) {
    return false;
  }

  if (/^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  const numbers = digits.split("").map(Number);
  const firstDigit = calculateCpfCheckDigit(numbers.slice(0, 9), 10);
  const secondDigit = calculateCpfCheckDigit(numbers.slice(0, 10), 11);

  return numbers[9] === firstDigit && numbers[10] === secondDigit;
}

function calculateCpfCheckDigit(
  numbers: number[],
  initialWeight: number
): number {
  const total = numbers.reduce(
    (sum, currentNumber, index) =>
      sum + currentNumber * (initialWeight - index),
    0
  );
  const remainder = (total * 10) % 11;

  return remainder === 10 ? 0 : remainder;
}
