import { Excalidraw } from '@alkemio/excalidraw';
import { ExportedDataState } from '@alkemio/excalidraw/types/data/types';
import { AppState, BinaryFiles, ExcalidrawImperativeAPI, ExcalidrawProps } from '@alkemio/excalidraw/types/types';
import { makeStyles } from '@mui/styles';
import { debounce, merge } from 'lodash';
import React, { Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCombinedRefs } from '../../../shared/utils/useCombinedRefs';
import EmptyWhiteboard from '../EmptyWhiteboard';
import { ExcalidrawElement } from '@alkemio/excalidraw/types/element/types';
import Collab, { CollabAPI } from './collab/Collab';
import { useUserContext } from '../../../community/user';
import { WhiteboardFilesManager } from './useWhiteboardFilesManager';

const useActorWhiteboardStyles = makeStyles(theme => ({
  container: {
    height: '100%',
    flexGrow: 1,
  },
  '@global': {
    '.excalidraw-modal-container': {
      zIndex: `${theme.zIndex.modal + 1} !important`,
    },
  },
  excalidrawAlkemioBackground: {
    background: `${theme.palette.primary.dark} !important`,
  },
}));

export interface WhiteboardWhiteboardEntities {
  whiteboard: { id?: string; content: string } | undefined;
  filesManager: WhiteboardFilesManager;
}

export interface WhiteboardWhiteboardActions {
  onUpdate?: (state: ExportedDataState) => Promise<{ success: boolean; errors?: string[] }>;
  onInitApi?: (excalidrawApi: ExcalidrawImperativeAPI) => void;
  onSavedToDatabase?: () => void;
}

export interface WhiteboardWhiteboardEvents {
  onCollaborationEnabledChange?: (collaborationEnabled: boolean) => void;
}

export interface WhiteboardWhiteboardOptions extends ExcalidrawProps {}

export interface WhiteboardWhiteboardProps {
  entities: WhiteboardWhiteboardEntities;
  options?: WhiteboardWhiteboardOptions;
  actions: WhiteboardWhiteboardActions;
  events: WhiteboardWhiteboardEvents;
  collabApiRef?: Ref<CollabAPI | null>;
}

const WINDOW_SCROLL_HANDLER_DEBOUNCE_INTERVAL = 100;

const CollaborativeExcalidrawWrapper = ({
  entities,
  actions,
  options,
  events,
  collabApiRef,
}: WhiteboardWhiteboardProps) => {
  const { whiteboard, filesManager } = entities;

  const [collabAPI, setCollabAPI] = useState<CollabAPI | null>(null);
  const combinedCollabApiRef = useCombinedRefs<CollabAPI | null>(null, collabApiRef);

  const styles = useActorWhiteboardStyles();

  const [collaborationEnabled, setCollaborationEnabled] = useState(true);

  const { user } = useUserContext();
  const username = user?.user.profile.displayName ?? 'User';

  const { addNewFile, loadFiles, pushFilesToExcalidraw } = filesManager;

  const data = useMemo(() => {
    const parsedData = whiteboard?.content ? JSON.parse(whiteboard?.content) : EmptyWhiteboard;
    return {
      ...parsedData,
      zoomToFit: true,
    };
  }, [whiteboard?.content]);

  useEffect(() => {
    loadFiles(data);
  }, [data]);

  useEffect(() => {
    pushFilesToExcalidraw();
  }, [filesManager]);

  const handleScroll = useRef(
    debounce(async () => {
      excalidrawApiRef.current?.refresh();
    }, WINDOW_SCROLL_HANDLER_DEBOUNCE_INTERVAL)
  ).current;

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      handleScroll.cancel();
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [handleScroll]);

  const UIOptions: ExcalidrawProps['UIOptions'] = useMemo(
    () => ({
      canvasActions: {
        export: {
          saveFileToDisk: true,
        },
      },
    }),
    []
  );

  const { UIOptions: externalUIOptions, ...restOptions } = options || {};

  const mergedUIOptions = useMemo(() => merge(UIOptions, externalUIOptions), [UIOptions, externalUIOptions]);

  const onChange = (elements: readonly ExcalidrawElement[], _appState: AppState, files: BinaryFiles) => {
    collabAPI?.syncElements(elements);
    collabAPI?.syncFiles(files);
  };

  useEffect(() => {
    if (collabAPI && whiteboard?.id) {
      collabAPI.startCollaboration({
        roomId: whiteboard.id,
      });
      setCollaborationEnabled(true);
      events.onCollaborationEnabledChange?.(true);
    }
    return () => {
      setCollaborationEnabled(false);
      events.onCollaborationEnabledChange?.(false);
      collabAPI?.stopCollaboration();
    };
  }, [collabAPI, whiteboard?.id]);

  const collabRef = useCallback((collabApi: CollabAPI | null) => {
    combinedCollabApiRef.current = collabApi;
    setCollabAPI(collabApi);
  }, []);

  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI | null>(null);
  const handleInitializeApi = useCallback(
    (excalidrawApi: ExcalidrawImperativeAPI) => {
      excalidrawApiRef.current = excalidrawApi;
      actions.onInitApi?.(excalidrawApi);
    },
    [actions.onInitApi]
  );

  return (
    <div className={styles.container}>
      {whiteboard && (
        <Excalidraw
          key={whiteboard.id} // initializing a fresh Excalidraw for each whiteboard
          excalidrawAPI={handleInitializeApi}
          initialData={data}
          UIOptions={mergedUIOptions}
          isCollaborating={collaborationEnabled}
          viewModeEnabled={!collaborationEnabled}
          gridModeEnabled
          onChange={onChange}
          onPointerUpdate={collabAPI?.onPointerUpdate}
          detectScroll={false}
          autoFocus
          generateIdForFile={addNewFile}
          /*renderTopRightUI={_isMobile => {
              return <LiveCollaborationStatus />;
            }}*/
          {...restOptions}
        />
      )}
      {excalidrawApiRef.current && (
        <Collab
          username={username}
          excalidrawAPI={excalidrawApiRef.current}
          collabAPIRef={collabRef}
          onSavedToDatabase={actions.onSavedToDatabase}
          filesManager={filesManager}
          onSaveRequest={async () => {
            if (excalidrawApiRef.current) {
              const state = {
                ...(data as ExportedDataState),
                elements: excalidrawApiRef.current.getSceneElements(),
                appState: excalidrawApiRef.current.getAppState(),
              };
              const result = await actions.onUpdate?.(state);
              return result ?? { success: false, errors: ['Update handler not defined'] };
            }
            return { success: false, errors: ['ExcalidrawAPI not yet ready'] };
          }}
          onCloseConnection={() => {
            setCollaborationEnabled(false);
            events.onCollaborationEnabledChange?.(false);
          }}
        />
      )}
    </div>
  );
};

export default CollaborativeExcalidrawWrapper;
