import { Excalidraw } from '@alkemio/excalidraw';
import { ExportedDataState } from '@alkemio/excalidraw/types/data/types';
import { AppState, BinaryFiles, ExcalidrawImperativeAPI, ExcalidrawProps } from '@alkemio/excalidraw/types/types';
import { makeStyles } from '@mui/styles';
import { debounce, merge } from 'lodash';
import React, { Ref, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCombinedRefs } from '../../../shared/utils/useCombinedRefs';
import EmptyWhiteboard from '../EmptyWhiteboard';
import { ExcalidrawElement } from '@alkemio/excalidraw/types/element/types';
import { useUserContext } from '../../../community/user';
import { WhiteboardFilesManager } from './useWhiteboardFilesManager';
import useCollab, { CollabAPI } from './collab/useCollab';
import Dialog from '@mui/material/Dialog';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { DialogContent } from '../../../../core/ui/dialog/deprecated';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import { Text } from '../../../../core/ui/typography';
import { formatTimeElapsed } from '../../../shared/utils/formatTimeElapsed';
import { Button, DialogActions } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LoadingButton } from '@mui/lab';

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
  lastSavedDate: Date | undefined;
}

export interface WhiteboardWhiteboardActions {
  onUpdate?: (state: ExportedDataState) => Promise<{ success: boolean; errors?: string[] }>;
  onInitApi?: (excalidrawApi: ExcalidrawImperativeAPI) => void;
  onSavedToDatabase?: () => void;
}

export interface WhiteboardWhiteboardEvents {}

export interface WhiteboardWhiteboardOptions extends ExcalidrawProps {}

export interface WhiteboardWhiteboardProps {
  entities: WhiteboardWhiteboardEntities;
  options: WhiteboardWhiteboardOptions;
  actions: WhiteboardWhiteboardActions;
  events?: WhiteboardWhiteboardEvents;
  collabApiRef?: Ref<CollabAPI | null>;
}

const WINDOW_SCROLL_HANDLER_DEBOUNCE_INTERVAL = 100;

const CollaborativeExcalidrawWrapper = ({ entities, actions, options, collabApiRef }: WhiteboardWhiteboardProps) => {
  const { whiteboard, filesManager, lastSavedDate } = entities;

  const combinedCollabApiRef = useCombinedRefs<CollabAPI | null>(null, collabApiRef);

  const styles = useActorWhiteboardStyles();

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
      excalidrawApi?.refresh();
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

  const { UIOptions: externalUIOptions, ...restOptions } = options;

  const mergedUIOptions = useMemo(() => merge(UIOptions, externalUIOptions), [UIOptions, externalUIOptions]);

  const [collabApi, initializeCollab, { connecting, collaborating }] = useCollab({
    username,
    onSavedToDatabase: actions.onSavedToDatabase,
    filesManager,
    onSaveRequest: async () => {
      if (excalidrawApi) {
        const state = {
          ...(data as ExportedDataState),
          elements: excalidrawApi.getSceneElements(),
          files: excalidrawApi.getFiles(),
          appState: excalidrawApi.getAppState(),
        };
        const result = await actions.onUpdate?.(state);
        return result ?? { success: false, errors: ['Update handler not defined'] };
      }
      return { success: false, errors: ['ExcalidrawAPI not yet ready'] };
    },
    onCloseConnection: () => {
      setCollaborationStoppedNoticeOpen(true);
    },
    onInitialize: collabApi => {
      combinedCollabApiRef.current = collabApi;
    },
  });

  const onChange = async (elements: readonly ExcalidrawElement[], _appState: AppState, files: BinaryFiles) => {
    const uploadedFiles = await filesManager.getUploadedFiles(files);
    collabApi?.syncScene(elements, uploadedFiles);
  };

  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);

  const [collaborationStartTime, setCollaborationStartTime] = useState<number | null>(Date.now());

  const restartCollaboration = () => {
    setCollaborationStartTime(Date.now());
  };

  useEffect(() => {
    if (!connecting && collaborating) {
      setCollaborationStoppedNoticeOpen(false);
    }
  }, [connecting, collaborating]);

  useEffect(() => {
    if (excalidrawApi && whiteboard?.id && collaborationStartTime !== null) {
      return initializeCollab({
        excalidrawApi,
        roomId: whiteboard.id,
      });
    }
  }, [excalidrawApi, whiteboard?.id, collaborationStartTime]);

  const handleInitializeApi = useCallback(
    (excalidrawApi: ExcalidrawImperativeAPI) => {
      setExcalidrawApi(excalidrawApi);
      actions.onInitApi?.(excalidrawApi);
    },
    [actions.onInitApi]
  );

  const [collaborationStoppedNoticeOpen, setCollaborationStoppedNoticeOpen] = useState(false);

  const { t } = useTranslation();

  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnlineChange = () => setIsOnline(navigator.onLine);
    window.addEventListener('online', handleOnlineChange);
    window.addEventListener('offline', handleOnlineChange);
    setIsOnline(navigator.onLine);
    return () => {
      window.removeEventListener('online', handleOnlineChange);
      window.removeEventListener('offline', handleOnlineChange);
    };
  }, []);

  return (
    <>
      <div className={styles.container}>
        {whiteboard && (
          <Excalidraw
            key={whiteboard.id} // initializing a fresh Excalidraw for each whiteboard
            excalidrawAPI={handleInitializeApi}
            initialData={data}
            UIOptions={mergedUIOptions}
            isCollaborating={collaborating}
            viewModeEnabled={!collaborating}
            gridModeEnabled
            onChange={onChange}
            onPointerUpdate={collabApi?.onPointerUpdate}
            detectScroll={false}
            autoFocus
            generateIdForFile={addNewFile}
            /*renderTopRightUI={_isMobile => {
                return <LiveCollaborationStatus />;
              }}*/
            {...restOptions}
          />
        )}
      </div>
      <Dialog open={collaborationStoppedNoticeOpen} onClose={() => setCollaborationStoppedNoticeOpen(false)}>
        <DialogHeader title={t('pages.whiteboard.whiteboardDisconnected.title')} />
        <DialogContent>
          {isOnline && <WrapperMarkdown>{t('pages.whiteboard.whiteboardDisconnected.message')}</WrapperMarkdown>}
          {!isOnline && <WrapperMarkdown>{t('pages.whiteboard.whiteboardDisconnected.offline')}</WrapperMarkdown>}
          {lastSavedDate && (
            <Text>
              {t('pages.whiteboard.whiteboardDisconnected.lastSaved', {
                lastSaved: formatTimeElapsed(lastSavedDate, t),
              })}
            </Text>
          )}
        </DialogContent>
        <DialogActions>
          <LoadingButton onClick={restartCollaboration} disabled={!isOnline} loading={connecting}>
            Reconnect
          </LoadingButton>
          <Button onClick={() => setCollaborationStoppedNoticeOpen(false)}>{t('buttons.ok')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CollaborativeExcalidrawWrapper;
