export interface GuestNameValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Validates guest name according to specification rules
 * - Non-empty after trim
 * - Max 50 characters
 * - Alphanumeric + hyphens/underscores only
 */
export const validateGuestName = (guestName: string): GuestNameValidationResult => {
  const trimmed = guestName.trim();

  if (!trimmed) {
    return { valid: false, error: 'Please enter a valid guest name' };
  }

  if (trimmed.length > 50) {
    return { valid: false, error: 'Guest name must be 50 characters or less' };
  }

  if (!/^[a-zA-Z0-9_-]+$/.test(trimmed)) {
    return {
      valid: false,
      error: 'Guest name can only contain letters, numbers, hyphens, and underscores',
    };
  }

  return { valid: true };
};
