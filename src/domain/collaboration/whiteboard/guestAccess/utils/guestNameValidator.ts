export interface GuestNameValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates guest name according to specification rules
 * - Non-empty after trim
 * - Max 50 characters
 * - Unicode letters and numbers + spaces, hyphens, underscores
 * - Accepts international names (José, François, Müller, 李明)
 */
export const validateGuestName = (guestName: string): GuestNameValidationResult => {
  const trimmed = guestName.trim();

  if (!trimmed) {
    return { valid: false, error: 'Please enter a valid guest name' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Guest name must be 50 characters or less' };
  }

  if (!/^[\p{L}\p{N} _-]+$/u.test(trimmed)) {
    return {
      valid: false,
      error:
        'Guest name can only contain letters (including accented characters), numbers, spaces, hyphens, and underscores',
    };
  }

  return { valid: true };
};
