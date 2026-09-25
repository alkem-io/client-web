import { type ReactNode, useEffect } from 'react';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { isAdmitted } from './matrixConfig';
import { redactString } from './redaction';
import { establishSession, onMessagingOpened, type SessionHandle, type SessionState } from './sessionController';

type MatrixDiagnostics = {
  readonly state: SessionState;
  readonly lastError: string | undefined;
};

declare global {
  interface Window {
    /**
     * Session diagnostics for the live proof: current lifecycle state
     * and the last redacted error, nothing else. Present in every build in
     * which the foundation is active for an admitted user; never assigned at
     * all while the flag is off. No token material is reachable through it.
     */
    __alkemioMatrix?: MatrixDiagnostics;
  }
}

/**
 * Owns the browser Matrix session lifecycle. Dormant until the current user is
 * admitted by the feature flag AND the messaging surface has been opened once;
 * only then does it load the SDK (dynamic import) and establish the session.
 */
const MatrixSessionProvider = ({ children }: { children: ReactNode }) => {
  const { userModel } = useCurrentUserContext();
  const actorId = userModel?.id;

  useEffect(() => {
    if (!actorId || !isAdmitted(actorId)) {
      return;
    }

    window.__alkemioMatrix = { state: 'idle', lastError: undefined };
    const updateDiagnostics = (patch: Partial<MatrixDiagnostics>): void => {
      window.__alkemioMatrix = {
        state: 'idle',
        lastError: undefined,
        ...window.__alkemioMatrix,
        ...patch,
      };
    };

    let disposed = false;
    let establishing = false;
    let handle: SessionHandle | null = null;

    const unsubscribe = onMessagingOpened(() => {
      if (disposed || establishing) {
        return;
      }
      establishing = true;
      establishSession(actorId, {
        onState: state => {
          updateDiagnostics({ state });
        },
        onError: message => {
          updateDiagnostics({ lastError: redactString(message) });
        },
      })
        .then(established => {
          if (disposed) {
            established.stop();
            return;
          }
          handle = established;
        })
        .catch(error => {
          updateDiagnostics({
            state: 'failed',
            lastError: redactString(error instanceof Error ? error.message : String(error)),
          });
        });
    });

    return () => {
      disposed = true;
      unsubscribe();
      handle?.stop();
    };
  }, [actorId]);

  return children;
};

export { MatrixSessionProvider };
