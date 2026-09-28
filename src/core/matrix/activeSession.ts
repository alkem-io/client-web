/**
 * Per-tab registry of the one live Matrix session's sign-out hook, so the
 * Alkemio sign-out flow can stop it without holding a reference to it.
 */
type SignOut = () => void;

let current: SignOut | null = null;

const registerActiveSession = (signOut: SignOut): void => {
  current = signOut;
};

const unregisterActiveSession = (signOut: SignOut): void => {
  if (current === signOut) {
    current = null;
  }
};

/**
 * Stops the registered session, if any. Returns whether one was registered,
 * so a caller can skip further work (e.g. storage enumeration) when none was.
 */
const stopActiveSession = (): boolean => {
  const signOut = current;
  current = null;
  if (signOut) {
    signOut();
    return true;
  }
  return false;
};

export { registerActiveSession, unregisterActiveSession, stopActiveSession };
