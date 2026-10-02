import { useEffect } from 'react';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import usePlatformOrigin from '@/domain/platform/routes/usePlatformOrigin';
import { establishSession } from './sessionController';

/** Establishes and syncs the browser's Matrix session for the current actor. Renders nothing. */
const MatrixSession = () => {
  const { userModel } = useCurrentUserContext();
  const actorId = userModel?.id;
  const platformOrigin = usePlatformOrigin();

  useEffect(() => {
    // The silent-SSO callback lives on the platform origin, so nothing starts
    // until that origin is known.
    if (!actorId || !platformOrigin) {
      return;
    }
    // Aborting stops the session wherever it is — mid-SSO or already syncing.
    const session = new AbortController();
    void establishSession(actorId, { signal: session.signal, platformOrigin });
    return () => session.abort();
  }, [actorId, platformOrigin]);

  return null;
};

export { MatrixSession };
