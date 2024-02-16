import { useRef } from 'react';
import Collab, { CollabAPI, CollabProps } from './Collab';

type UseCollabProvided = [CollabAPI | null, (initProps: InitProps) => void];

interface UseCollabProps extends Omit<CollabProps, 'excalidrawApi'> {
  onInitialize?: (collabApi: CollabAPI) => void;
}

interface InitProps extends Pick<CollabProps, 'excalidrawApi'> {
  roomId: string;
}

const useCollab = ({ onInitialize, ...collabProps }: UseCollabProps): UseCollabProvided => {
  const collabRef = useRef<Collab | null>(null);

  const collabApiRef = useRef<CollabAPI | null>(null);

  const initialize = ({ excalidrawApi, roomId }: InitProps) => {
    collabRef.current = new Collab({
      ...collabProps,
      excalidrawApi,
    });
    const collabApi = collabRef.current.init();
    collabApi.startCollaboration({ roomId });
    collabApiRef.current = collabApi;
    onInitialize?.(collabApi);

    return () => {
      collabRef.current?.destroy();
      collabApiRef.current = null;
    };
  };

  return [collabApiRef.current, initialize];
};

export default useCollab;
