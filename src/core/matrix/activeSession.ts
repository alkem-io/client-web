/**
 * Per-tab registry of what the current sign-in has established: the one live
 * Matrix session's sign-out hook (so the Alkemio sign-out flow can stop it
 * without holding the handle) and the messaging-opened latch that gates
 * establishment. Both are facts about the current sign-in and are reset on
 * sign-out, so the next actor starts dormant.
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

/** The registered callback owns the signed-out transition and client shutdown. */
const stopActiveSession = (): void => {
  const signOut = current;
  current = null;
  signOut?.();
};

let messagingOpened = false;
const activationListeners = new Set<() => void>();

const notifyMessagingOpened = (): void => {
  if (messagingOpened) {
    return;
  }
  messagingOpened = true;
  for (const listener of activationListeners) {
    listener();
  }
  activationListeners.clear();
};

const onMessagingOpened = (listener: () => void): (() => void) => {
  if (messagingOpened) {
    listener();
    return () => {};
  }
  activationListeners.add(listener);
  return () => {
    activationListeners.delete(listener);
  };
};

/** Sign-out invalidates the latch: the next actor must open messaging again before anything establishes. */
const resetMessagingActivation = (): void => {
  messagingOpened = false;
};

export {
  registerActiveSession,
  unregisterActiveSession,
  stopActiveSession,
  notifyMessagingOpened,
  onMessagingOpened,
  resetMessagingActivation,
};
