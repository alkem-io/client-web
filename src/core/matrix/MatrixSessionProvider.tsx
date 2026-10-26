import { useEffect } from 'react';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import useIdentityOrigin from '@/domain/platform/routes/useIdentityOrigin';
import usePlatformOrigin from '@/domain/platform/routes/usePlatformOrigin';
import { establishSession } from './sessionController';

/** Establishes and syncs the browser's Matrix session for the current actor. Renders nothing. */
const MatrixSession = () => {
  const { userModel } = useCurrentUserContext();
  const actorId = userModel?.id;
  const platformOrigin = usePlatformOrigin();
  const identityOrigin = useIdentityOrigin();

  useEffect(() => {
    // The silent-SSO callback lives on the platform origin, so nothing starts
    // until that origin is known.
    if (!actorId || !platformOrigin) {
      return;
    }
    // This provider is mounted above the routes, so it also runs on the identity
    // origin the browser passes through while signing in. Starting there cannot
    // ever work: the callback would hand the token back to *that* origin and the
    // credentials would land in its IndexedDB, which the platform origin never
    // reads. `NonIdentity` replaces the location with the platform origin, and
    // that full reload mounts this provider again where it can succeed.
    //
    // Do NOT "simplify" this to `window.location.origin !== platformOrigin`: an
    // innovation hub legitimately serves the app from a third origin, and the
    // callback's `parent` handoff (see `ssoLogin`/`matrixCallback`) exists for
    // exactly that case. Only the identity origin is unusable.
    if (window.location.origin === identityOrigin) {
      return;
    }
    // Aborting stops the session wherever it is — mid-SSO or already syncing.
    const session = new AbortController();
    void establishSession(actorId, { signal: session.signal, platformOrigin });
    return () => session.abort();
  }, [actorId, platformOrigin, identityOrigin]);

  return null;
};

export { MatrixSession };
