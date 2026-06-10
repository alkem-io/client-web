const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * True when `value` is a syntactically valid email address. Trims first so
 * validation matches the trimmed value the form mappers actually submit.
 */
export const isValidEmail = (value: string): boolean => EMAIL_REGEX.test(value.trim());

/** True when `value` is empty (whitespace-only) or a valid email — optional-field validation. */
export const isValidEmailOrEmpty = (value: string): boolean => {
  const trimmed = value.trim();
  return !trimmed || EMAIL_REGEX.test(trimmed);
};

/** True when `value` is empty (whitespace-only) or a parseable absolute URL — optional-field validation. */
export const isValidUrlOrEmpty = (value: string): boolean => {
  const trimmed = value.trim();
  if (!trimmed) return true;
  try {
    void new URL(trimmed);
    return true;
  } catch {
    return false;
  }
};
