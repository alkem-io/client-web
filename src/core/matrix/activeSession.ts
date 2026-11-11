/**
 * Per-tab registry of the one live Matrix session's hooks: its sign-out, so
 * the Alkemio sign-out flow can stop it without holding a reference to it, and
 * its pre-call rotation, so a call click can replace a credential near expiry.
 */
type SignOut = () => void;
type Rotate = () => Promise<boolean>;

const noRotation: Rotate = () => Promise.resolve(false);

let current: { readonly stop: SignOut; readonly rotateIfDue: Rotate } | null = null;

const registerActiveSession = (stop: SignOut, rotateIfDue: Rotate = noRotation): void => {
  current = { stop, rotateIfDue };
};

const unregisterActiveSession = (stop: SignOut): void => {
  if (current?.stop === stop) {
    current = null;
  }
};

/** Stops the registered session, if any. Returns whether one was registered. */
const stopActiveSession = (): boolean => {
  const session = current;
  current = null;
  if (session) {
    session.stop();
    return true;
  }
  return false;
};

/** Rotates the registered session's credential when due; true when a rotation was attempted, so no call opens. */
const rotateActiveSessionIfDue = (): Promise<boolean> => (current ? current.rotateIfDue() : Promise.resolve(false));

export { registerActiveSession, unregisterActiveSession, stopActiveSession, rotateActiveSessionIfDue };
