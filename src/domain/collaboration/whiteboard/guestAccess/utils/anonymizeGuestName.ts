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
 * 1. `firstName lastName` → "FirstName L." (e.g., "Alice B.")
 * 2. `firstName` only → "FirstName" (e.g., "Alice")
 * 3. `lastName` only → "L." (e.g., "B.")
 * 4. Neither → `null` (caller should prompt for nickname)
 *
 * **Edge Cases:**
 * - Multi-word first names: Takes only the first word
 * - Whitespace-only strings: Treated as empty
 * - Case sensitivity: Last initial is always uppercase
 *
 * @example
 * ```typescript
 * anonymizeGuestName('Alice', 'Brown');      // "Alice B."
 * anonymizeGuestName('Alice Marie', 'Brown'); // "Alice B."
 * anonymizeGuestName('Alice', null);          // "Alice"
 * anonymizeGuestName(null, 'Brown');          // "B."
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
export const anonymizeGuestName = (
  firstName?: string | null,
  lastName?: string | null
): string | null => {
  const f = (firstName || '').trim();
  const l = (lastName || '').trim();

  if (f && l) {
    // Priority 1: First name + last initial
    // Extract first word from firstName (handles "Alice Marie" → "Alice")
    const firstWord = f.split(/\s+/)[0];
    const lastInitial = l.charAt(0).toUpperCase();
    return `${firstWord} ${lastInitial}.`;
  }

  if (f) {
    // Priority 2: First name only
    // Extract first word (handles multi-word first names)
    return f.split(/\s+/)[0];
  }

  if (l) {
    // Priority 3: Last initial only
    return `${l.charAt(0).toUpperCase()}.`;
  }

  // Priority 4: No derivation possible
  // Caller should display join dialog to prompt for nickname
  return null;
};
