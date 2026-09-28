import { useEffect } from 'react';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { establishSession } from './sessionController';

/** Establishes the browser's Matrix session for the current actor. Renders nothing. */
const MatrixSession = () => {
  const { userModel } = useCurrentUserContext();
  const actorId = userModel?.id;

  useEffect(() => {
    if (!actorId) {
      return;
    }
    // Aborting stops the session wherever it is — mid-SSO or already created.
    const session = new AbortController();
    void establishSession(actorId, { signal: session.signal });
    return () => session.abort();
  }, [actorId]);

  return null;
};

export { MatrixSession };
