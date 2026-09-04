/**
 * Registry of the one live Matrix session in this tab, so the Alkemio sign-out
 * flow can stop it without holding a reference to the session handle.
 * The registered callback owns the signed-out transition and client shutdown.
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

const stopActiveSession = (): void => {
  const signOut = current;
  current = null;
  signOut?.();
};

export { registerActiveSession, unregisterActiveSession, stopActiveSession };
