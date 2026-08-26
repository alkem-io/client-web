import { createContext, type ReactNode, useContext, useEffect, useState } from 'react';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { isAdmitted } from './matrixConfig';
import { establishSession, onMessagingOpened, type SessionHandle, type SessionState } from './sessionController';

interface MatrixSessionContextValue {
  readonly state: SessionState;
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
        },
        onRooms: rooms => {
          // biome-ignore lint/suspicious/noConsole: temporary local-proof observability, removed before PR
          console.info(
            `[matrix] session ready — ${rooms.length} rooms`,
            rooms.map(room => `${room.name} (${room.roomId})`)
          );
        },
      })
        .then(established => {
          if (disposed) {
            established.stop();
            return;
          }
          handle = established;
        })
        .catch(() => {
          if (!disposed) {
            setSessionState('failed');
          }
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
