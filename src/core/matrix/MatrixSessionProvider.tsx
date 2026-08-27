import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { isAdmitted } from './matrixConfig';
import { redactString } from './redaction';
import { establishSession, onMessagingOpened, type SessionHandle, type SessionState } from './sessionController';

interface MatrixSessionContextValue {
  readonly state: SessionState;
}

interface MatrixDiagnostics {
  readonly state: SessionState;
  readonly lastError: string | undefined;
}

declare global {
  interface Window {
    /**
     * Session diagnostics for the live proof (FR-011): current lifecycle state
     * and the last redacted error, nothing else. Present in every build in
     * which the foundation is active for an admitted user; never assigned at
     * all while the flag is off. No token material is reachable through it.
     */
    __alkemioMatrix?: MatrixDiagnostics;
  }
}

const MatrixSessionContext = createContext<MatrixSessionContextValue>({ state: 'idle' });

/**
 * Owns the browser Matrix session lifecycle. Dormant until the current user is
 * admitted by the feature flag AND the messaging surface has been opened once;
 * only then does it load the SDK (dynamic import) and establish the session.
 */
const MatrixSessionProvider = ({ children }: { children: ReactNode }) => {
  const { userModel } = useCurrentUserContext();
  const actorId = userModel?.id;
  const [sessionState, setSessionState] = useState<SessionState>('idle');

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
          if (!disposed) {
            setSessionState(state);
          }
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
          if (!disposed) {
            setSessionState('failed');
          }
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
      setSessionState('idle');
    };
  }, [actorId]);

  return <MatrixSessionContext value={{ state: sessionState }}>{children}</MatrixSessionContext>;
};

const useMatrixSessionContext = () => useContext(MatrixSessionContext);

export { MatrixSessionProvider, useMatrixSessionContext };
