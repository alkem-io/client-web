/**
 * Anonymization algorithm for deriving guest names from user profiles
 *
 * This utility provides privacy-safe guest name derivation for authenticated users
 * accessing public whiteboards. Instead of displaying full names or prompting for
 * nicknames, we derive abbreviated names following a consistent priority system.
 *
 * **Privacy Rationale:**
 * Guest whiteboards are public and may be shared externally. Using full names
 * could leak identity information. Abbreviated names provide enough context for
 * collaboration while maintaining privacy.
 *
 * **Derivation Priority:**
 * 1. `firstName lastName` → "FirstName L" (e.g., "Alice B")
 * 2. `firstName` only → "FirstName" (e.g., "Alice")
 * 3. `lastName` only → "L" (e.g., "B")
 * 4. Neither → `null` (caller should prompt for nickname)
 *
 * The derived name is SANITIZED so it always passes `validateGuestName` (alphabet
 * `/^[\p{L}\p{N} _-]+$/u`, max 50 chars): characters outside that set — most commonly
 * in-word apostrophes and periods (O'Brien, Dr.) — are stripped, and the result is
 * length-bounded. Without this, such names failed the validator → `guestName` came back
 * undefined → the user silently fell back to the generic "Guest". The same value must be
 * usable as the guest identity across the WS handshake, the asset-fetch header, and the
 * awareness cursor label.
 *
 * **Edge Cases:**
 * - Multi-word first names: Takes only the first word
 * - Whitespace-only strings: Treated as empty
 * - Case sensitivity: Last initial is always uppercase
 *
 * @example
 * ```typescript
 * anonymizeGuestName('Alice', 'Brown');      // "Alice B"
 * anonymizeGuestName('Alice Marie', 'Brown'); // "Alice B"
 * anonymizeGuestName('Alice', null);          // "Alice"
 * anonymizeGuestName(null, 'Brown');          // "B"
 * anonymizeGuestName('', '');                 // null
 * anonymizeGuestName('  ', '  ');             // null
 * ```
 *
 * @param firstName - User's first name (may be null, empty, or whitespace)
 * @param lastName - User's last name (may be null, empty, or whitespace)
 * @returns Derived guest name or null if no derivation is possible
 *
 * @see {@link https://github.com/alkem-io/client-web/blob/develop/specs/002-guest-whiteboard-access/spec.md | Feature Spec}
 * @see FR-018..FR-023 in spec for full derivation requirements
 */
/** Mirrors `validateGuestName`'s length bound so a derived name is never over-long. */
const GUEST_NAME_MAX_LENGTH = 50;

/**
 * Coerce a derived name into `validateGuestName`'s alphabet + length bound: strip every
 * character outside `/[\p{L}\p{N} _-]/u` (apostrophes, periods, punctuation), collapse the
 * whitespace that stripping may leave, trim, and cap at {@link GUEST_NAME_MAX_LENGTH}.
 */
const toValidGuestName = (name: string): string =>
  name
    .replace(/[^\p{L}\p{N} _-]/gu, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, GUEST_NAME_MAX_LENGTH)
    .trim();

export const anonymizeGuestName = (firstName?: string | null, lastName?: string | null): string | null => {
  const f = (firstName || '').trim();
  const l = (lastName || '').trim();

  let derived: string | null = null;
  if (f && l) {
    // Priority 1: First name + last initial. Extract the first word from firstName
    // (handles "Alice Marie" → "Alice").
    const firstWord = f.split(/\s+/)[0];
    const lastInitial = l.charAt(0).toUpperCase();
    derived = `${firstWord} ${lastInitial}`;
  } else if (f) {
    // Priority 2: First name only (first word, handles multi-word first names).
    derived = f.split(/\s+/)[0];
  } else if (l) {
    // Priority 3: Last initial only.
    derived = l.charAt(0).toUpperCase();
  }

  // Priority 4: No derivation possible — caller displays the join dialog to prompt for a nickname.
  if (derived === null) return null;

  // Sanitize so the result ALWAYS satisfies `validateGuestName`. If the name was pure
  // punctuation and sanitizing emptied it, fall back to the prompt (null) rather than
  // returning an invalid empty string.
  const valid = toValidGuestName(derived);
  return valid.length > 0 ? valid : null;
};
