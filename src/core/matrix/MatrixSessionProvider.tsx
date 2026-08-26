import { createContext, type ReactNode, useContext, useEffect, useRef, useState } from 'react';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { isAdmitted } from './matrixConfig';
import { establishSession, onMessagingOpened, type SessionState } from './sessionController';

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
  const startedRef = useRef(false);

  useEffect(() => {
    if (!actorId || !isAdmitted(actorId) || startedRef.current) {
      return;
    }
    return onMessagingOpened(() => {
      if (startedRef.current) {
        return;
      }
      startedRef.current = true;
      void establishSession(actorId, {
        onState: setSessionState,
        onRooms: rooms => {
          // biome-ignore lint/suspicious/noConsole: temporary local-proof observability, removed before PR
          console.info(
            `[matrix] session ready — ${rooms.length} rooms`,
            rooms.map(room => `${room.name} (${room.roomId})`)
          );
        },
      });
    });
  }, [actorId]);

  return <MatrixSessionContext value={{ state: sessionState }}>{children}</MatrixSessionContext>;
};

const useMatrixSessionContext = () => useContext(MatrixSessionContext);

export { MatrixSessionProvider, useMatrixSessionContext };
