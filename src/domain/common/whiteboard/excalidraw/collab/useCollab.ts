import { useRef, useState } from 'react';
import Collab, { CollabProps } from './Collab';

type CollabInstance = InstanceType<typeof Collab>;

export interface CollabAPI {
  /** function so that we can access the latest value from stale callbacks */
  onPointerUpdate: CollabInstance['onPointerUpdate'];
  syncScene: CollabInstance['syncScene'];
  // notifySavedToDatabase: () => void; // Notify rest of the members in the room that I have saved the whiteboard
  isCollaborating: () => boolean;
}

type UseCollabProvided = [CollabAPI | null, (initProps: InitProps) => void, CollabState];

interface UseCollabProps extends Omit<CollabProps, 'excalidrawApi'> {
  onInitialize?: (collabApi: CollabAPI) => void;
}

interface InitProps extends Pick<CollabProps, 'excalidrawApi'> {
  roomId: string;
}

interface CollabState {
  collaborating: boolean;
  connecting: boolean;
}

const useCollab = ({ onInitialize, onCloseConnection, ...collabProps }: UseCollabProps): UseCollabProvided => {
  const collabRef = useRef<Collab | null>(null);

  const collabApiRef = useRef<CollabAPI | null>(null);

  const [isConnecting, setIsConnecting] = useState(false);

  const [isCollaborating, setIsCollaborating] = useState(false);

  const handleCloseConnection = () => {
    try {
      onCloseConnection();
    } finally {
      setIsCollaborating(false);
    }
  };

  const initialize = ({ excalidrawApi, roomId }: InitProps) => {
    collabRef.current = new Collab({
      ...collabProps,
      excalidrawApi,
      onCloseConnection: handleCloseConnection,
    });

    collabRef.current.init();

    const collabApi: CollabAPI = {
      onPointerUpdate: collabRef.current.onPointerUpdate,
      syncScene: collabRef.current.syncScene,
      // notifySavedToDatabase: collabRef.current.notifySavedToDatabase,
      isCollaborating: collabRef.current.isCollaborating,
    };

    (async () => {
      setIsConnecting(true);
      try {
        await collabRef.current?.startCollaboration({ roomId });
        setIsCollaborating(true);
      } finally {
        setIsConnecting(false);
      }
    })();

    collabApiRef.current = collabApi;

    onInitialize?.(collabApi);

    return () => {
      collabRef.current?.stopCollaboration();
      collabRef.current?.destroy();
      collabApiRef.current = null;
    };
  };

  return [collabApiRef.current, initialize, { connecting: isConnecting, collaborating: isCollaborating }];
};

export default useCollab;
