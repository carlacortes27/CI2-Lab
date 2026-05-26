export function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || '').trim());
}

export function isValidPhone(number) {
  const digits = String(number || '').replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 14 && !/^(\d)\1+$/.test(digits);
}

export function isEndDateValid(startDate, endDate, current = false) {
  if (current || !startDate || !endDate) return true;
  return endDate >= startDate;
}

export function aboutMeStatus(text, max = 420) {
  const length = String(text || '').length;
  return { length, max, isValid: length <= max, remaining: max - length };
}
