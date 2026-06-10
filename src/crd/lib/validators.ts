const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** True when `value` is a syntactically valid email address. */
export const isValidEmail = (value: string): boolean => EMAIL_REGEX.test(value);

/** True when `value` is empty (whitespace-only) or a valid email — optional-field validation. */
export const isValidEmailOrEmpty = (value: string): boolean => !value.trim() || EMAIL_REGEX.test(value);

/** True when `value` is empty (whitespace-only) or a parseable absolute URL — optional-field validation. */
export const isValidUrlOrEmpty = (value: string): boolean => {
  if (!value.trim()) return true;
  try {
    void new URL(value);
    return true;
  } catch {
    return false;
  }
};
