import { useRef, useState } from 'react';
import Collab, { CollabProps } from './Collab';
import { CollaboratorMode, CollaboratorModeReasons } from './excalidrawAppConstants';

type CollabInstance = InstanceType<typeof Collab>;

export interface CollabAPI {
  /** function so that we can access the latest value from stale callbacks */
  onPointerUpdate: CollabInstance['onPointerUpdate'];
  syncScene: CollabInstance['syncScene'];
  isCollaborating: () => boolean;
}

type UseCollabProvided = [CollabAPI | null, (initProps: InitProps) => void, CollabState];

interface UseCollabProps extends Omit<CollabProps, 'excalidrawApi' | 'onCollaboratorModeChange'> {
  onInitialize?: (collabApi: CollabAPI) => void;
  onRemoteSave?: () => void;
}

interface InitProps extends Pick<CollabProps, 'excalidrawApi'> {
  roomId: string;
}

export interface CollabState {
  collaborating: boolean;
  connecting: boolean;
  mode: CollaboratorMode | null;
  modeReason: CollaboratorModeReasons | null;
}

const useCollab = ({
  onInitialize,
  onCloseConnection,
  onRemoteSave,
  ...collabProps
}: UseCollabProps): UseCollabProvided => {
  const collabRef = useRef<Collab | null>(null);

  const collabApiRef = useRef<CollabAPI | null>(null);

  const [isConnecting, setIsConnecting] = useState(false);

  const [isCollaborating, setIsCollaborating] = useState(false);

  const [collaboratorMode, setCollaboratorMode] = useState<CollaboratorMode | null>(null);

  const [collaboratorModeReason, setCollaboratorModeReason] = useState<CollaboratorModeReasons | null>(null);

  const handleCloseConnection = () => {
    try {
      onCloseConnection();
    } finally {
      setIsCollaborating(false);
    }
  };

  const handleRemoteSave = () => {
    onRemoteSave();
  };

  const initialize = ({ excalidrawApi, roomId }: InitProps) => {
    collabRef.current = new Collab({
      ...collabProps,
      excalidrawApi,
      onRemoteSave: handleRemoteSave,
      onCloseConnection: handleCloseConnection,
      onCollaboratorModeChange: ({ mode, reason }) => {
        setCollaboratorMode(mode);
        setCollaboratorModeReason(reason);
      },
    });

    collabRef.current.init();

    const collabApi: CollabAPI = {
      onPointerUpdate: collabRef.current.onPointerUpdate,
      syncScene: collabRef.current.syncScene,
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

  return [
    collabApiRef.current,
    initialize,
    {
      connecting: isConnecting,
      collaborating: isCollaborating && collaboratorMode !== null,
      mode: collaboratorMode,
      modeReason: collaboratorModeReason,
    },
  ];
};

export default useCollab;
