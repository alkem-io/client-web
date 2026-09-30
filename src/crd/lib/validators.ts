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
 * Mirrors what a PERSON may type into a nameID (alias) field: 3–25
 * characters, only `a-z`, `0-9` and `-`. Uppercase is rejected — the server's
 * `NameID` scalar lowercases inline literals but validates variables as-is,
 * so an uppercase alias sent from a client fails at variable coercion, before
 * any resolver runs, and comes back as an opaque `BAD_USER_INPUT`.
 *
 * The scalar itself accepts 28 (`scalar.nameid.ts`: `NAMEID_MAX_LENGTH + 3`),
 * but those last three characters are reserved headroom for the server's own
 * collision suffix (`-1`, `-12`) when a generated alias overlaps a reserved
 * one. 25 is therefore the correct limit for user entry, and matches the
 * long-standing `nameIdValidator` used by the pre-CRD forms.
 */
export const NAMEID_MIN_LENGTH = 3;
export const NAMEID_MAX_LENGTH = 25;

const NAMEID_REGEX = /^[a-z0-9-]+$/;

/** True when `value` is a valid nameID (alias). Trims first, as the form mappers do. */
export const isValidNameId = (value: string): boolean => {
  const trimmed = value.trim();
  return trimmed.length >= NAMEID_MIN_LENGTH && trimmed.length <= NAMEID_MAX_LENGTH && NAMEID_REGEX.test(trimmed);
};
