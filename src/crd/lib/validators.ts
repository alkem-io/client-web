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

/**
 * Mirrors the server's `NameID` GraphQL scalar
 * (`server/src/domain/common/scalars/scalar.nameid.ts`): 3–28 characters, only
 * `a-z`, `0-9` and `-`. Uppercase is rejected — the scalar lowercases inline
 * literals but validates variables as-is, so an uppercase alias sent from a
 * client fails at variable coercion, before any resolver runs, and comes back
 * as an opaque `BAD_USER_INPUT`.
 */
export const NAMEID_MIN_LENGTH = 3;
export const NAMEID_MAX_LENGTH = 28;

const NAMEID_REGEX = /^[a-z0-9-]+$/;

/** True when `value` is a valid nameID (alias). Trims first, as the form mappers do. */
export const isValidNameId = (value: string): boolean => {
  const trimmed = value.trim();
  return trimmed.length >= NAMEID_MIN_LENGTH && trimmed.length <= NAMEID_MAX_LENGTH && NAMEID_REGEX.test(trimmed);
};
