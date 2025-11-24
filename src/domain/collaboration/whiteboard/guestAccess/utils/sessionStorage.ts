const GUEST_NAME_KEY = 'alkemio_guest_name';
const GUEST_WHITEBOARD_URL_KEY = 'alkemio_guest_whiteboard_url';

export const getGuestName = (): string | null => {
  return globalThis.sessionStorage?.getItem(GUEST_NAME_KEY) ?? null;
};

export const setGuestName = (name: string): void => {
  globalThis.sessionStorage?.setItem(GUEST_NAME_KEY, name);
};

export const clearGuestName = (): void => {
  globalThis.sessionStorage?.removeItem(GUEST_NAME_KEY);
};

export const getGuestWhiteboardUrl = (): string | null => {
  return globalThis.sessionStorage?.getItem(GUEST_WHITEBOARD_URL_KEY) ?? null;
};

export const setGuestWhiteboardUrl = (url: string): void => {
  globalThis.sessionStorage?.setItem(GUEST_WHITEBOARD_URL_KEY, url);
};

export const clearGuestWhiteboardUrl = (): void => {
  globalThis.sessionStorage?.removeItem(GUEST_WHITEBOARD_URL_KEY);
};

/**
 * Clears all guest session data from session storage.
 * This should be called when a user successfully authenticates (login or registration)
 * to ensure no guest session data persists after authentication.
 */
export const clearAllGuestSessionData = (): void => {
  clearGuestName();
  clearGuestWhiteboardUrl();
};
