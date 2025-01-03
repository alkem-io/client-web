import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
} from '@alkemio/excalidraw/dist/excalidraw/types';
import type { OrderedExcalidrawElement } from '@alkemio/excalidraw/dist/excalidraw/element/types';
import { makeStyles } from '@mui/styles';
import { debounce, merge } from 'lodash';
import React, { PropsWithChildren, Ref, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';
import { useUserContext } from '@/domain/community/user';
import { WhiteboardFilesManager } from './useWhiteboardFilesManager';
import useCollab, { CollabAPI, CollabState } from './collab/useCollab';
import Dialog from '@mui/material/Dialog';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { DialogContent } from '@/core/ui/dialog/deprecated';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { Caption, Text } from '@/core/ui/typography';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { Box, Button, DialogActions } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { LoadingButton } from '@mui/lab';
import useOnlineStatus from '@/core/utils/onlineStatus';
import Reconnectable from '@/core/utils/reconnectable';
import { useTick } from '@/core/utils/time/tick';
import useWhiteboardDefaults from './useWhiteboardDefaults';
import Loading from '@/core/ui/loading/Loading';
import { Identifiable } from '@/core/utils/Identifiable';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';

const FILE_IMPORT_ENABLED = true;
const SAVE_FILE_TO_DISK = true;

const Excalidraw = lazyWithGlobalErrorHandler(async () => {
  const { Excalidraw } = await import('@alkemio/excalidraw');
  await import('@alkemio/excalidraw/index.css');
  return { default: Excalidraw };
});

const LoadingScene = React.memo(({ enabled }: { enabled: boolean }) => {
  const { t } = useTranslation();
  const styles = useActorWhiteboardStyles();

  return enabled ? (
    <Box className={styles.loadingScene}>
      <Loading text={t('pages.whiteboard.loadingScene')} />
    </Box>
  ) : null;
});

const useActorWhiteboardStyles = makeStyles(theme => ({
  container: {
    height: '100%',
    flexGrow: 1,
    position: 'relative',
  },
  loadingScene: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: `${theme.zIndex.modal + 2} !important`,
    backgroundColor: theme.palette.background.paper,
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
  whiteboard: Identifiable | undefined;
  filesManager: WhiteboardFilesManager;
  lastSavedDate: Date | undefined;
}

export interface WhiteboardWhiteboardActions {
  onInitApi?: (excalidrawApi: ExcalidrawImperativeAPI) => void;
  onSceneInitChange?: (initialized: boolean) => void;
  onRemoteSave?: () => void;
}

export interface WhiteboardWhiteboardEvents {}

export interface WhiteboardWhiteboardOptions extends ExcalidrawProps {}

interface CollaborativeExcalidrawWrapperProvided extends CollabState {
  restartCollaboration: () => void;
}

export interface WhiteboardWhiteboardProps {
  entities: WhiteboardWhiteboardEntities;
  options: WhiteboardWhiteboardOptions;
  actions: WhiteboardWhiteboardActions;
  events?: WhiteboardWhiteboardEvents;
  collabApiRef?: Ref<CollabAPI | null>;
  children: (props: PropsWithChildren<CollaborativeExcalidrawWrapperProvided>) => React.ReactNode;
}

const WINDOW_SCROLL_HANDLER_DEBOUNCE_INTERVAL = 100;

const useReconnectable = Reconnectable();

const CollaborativeExcalidrawWrapper = ({
  entities,
  actions,
  options,
  collabApiRef,
  children: renderChildren,
}: WhiteboardWhiteboardProps) => {
  const { whiteboard, filesManager, lastSavedDate } = entities;
  const whiteboardDefaults = useWhiteboardDefaults();

  const combinedCollabApiRef = useCombinedRefs<CollabAPI | null>(null, collabApiRef);

  const styles = useActorWhiteboardStyles();

  const { user } = useUserContext();
  const username = user?.user.profile.displayName ?? 'User';

  const [isSceneInitialized, setSceneInitialized] = useState(false);

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
        loadScene: FILE_IMPORT_ENABLED,
        export: {
          saveFileToDisk: SAVE_FILE_TO_DISK,
        },
      },
    }),
    []
  );

  const { UIOptions: externalUIOptions, ...restOptions } = options;

  const mergedUIOptions = useMemo(() => merge(UIOptions, externalUIOptions), [UIOptions, externalUIOptions]);

  const [collabApi, initializeCollab, { connecting, collaborating, mode, modeReason }] = useCollab({
    username,
    filesManager,
    onRemoteSave: () => actions.onRemoteSave?.(),
    onCloseConnection: () => {
      setCollaborationStoppedNoticeOpen(true);
      setSceneInitialized(false);
      if (isOnline) {
        setupReconnectTimeout();
      }
    },
    onInitialize: collabApi => {
      combinedCollabApiRef.current = collabApi;
    },
    onSceneInitChange: (initialized: boolean) => {
      setSceneInitialized(initialized);
      actions.onSceneInitChange?.(initialized);
    },
  });

  const onChange = async (elements: readonly OrderedExcalidrawElement[], _appState: AppState, files: BinaryFiles) => {
    const uploadedFiles = await filesManager.getUploadedFiles(files);
    collabApi?.syncScene(elements, uploadedFiles);
  };

  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);

  const [collaborationStartTime, setCollaborationStartTime] = useState<number | null>(Date.now());

  const [collaborationStoppedNoticeOpen, setCollaborationStoppedNoticeOpen] = useState(false);

  const isOnline = useOnlineStatus();

  const restartCollaboration = () => {
    setCollaborationStartTime(Date.now());
  };

  const { autoReconnectTime, setupReconnectTimeout } = useReconnectable({
    isOnline,
    reconnect: restartCollaboration,
    skip: !collaborationStoppedNoticeOpen || collaborating,
  });

  const time = useTick({
    skip: autoReconnectTime === null,
  });

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

  const { t } = useTranslation();

  const children = (
    <div className={styles.container}>
      <Suspense fallback={<Loading />}>
        <LoadingScene enabled={!isSceneInitialized} />
        {whiteboard && (
          <Excalidraw
            key={whiteboard.id} // initializing a fresh Excalidraw for each whiteboard
            excalidrawAPI={handleInitializeApi}
            initialData={whiteboardDefaults}
            UIOptions={mergedUIOptions}
            isCollaborating={collaborating}
            viewModeEnabled={!collaborating || mode === 'read' || !isSceneInitialized}
            onChange={onChange}
            onPointerUpdate={collabApi?.onPointerUpdate}
            detectScroll={false}
            autoFocus
            generateIdForFile={filesManager.addNewFile}
            aiEnabled={false}
            /*renderTopRightUI={_isMobile => {
                return <LiveCollaborationStatus />;
              }}*/
            {...restOptions}
          />
        )}
      </Suspense>
    </div>
  );

  return (
    <>
      {renderChildren({
        children,
        collaborating,
        connecting,
        mode,
        modeReason,
        restartCollaboration,
      })}
      <Dialog open={collaborationStoppedNoticeOpen} onClose={() => setCollaborationStoppedNoticeOpen(false)}>
        <DialogHeader title={t('pages.whiteboard.whiteboardDisconnected.title')} />
        <DialogContent>
          {isOnline && <WrapperMarkdown>{t('pages.whiteboard.whiteboardDisconnected.message')}</WrapperMarkdown>}
          {!isOnline && <WrapperMarkdown>{t('pages.whiteboard.whiteboardDisconnected.offline')}</WrapperMarkdown>}
          {lastSavedDate && (
            <Text>
              {t('pages.whiteboard.whiteboardDisconnected.lastSaved', {
                lastSaved: formatTimeElapsed(lastSavedDate, t, 'long'),
              })}
            </Text>
          )}
        </DialogContent>
        <DialogActions>
          <LoadingButton onClick={restartCollaboration} disabled={!isOnline} loading={connecting}>
            Reconnect
            <Caption textTransform="none">
              {autoReconnectTime !== null &&
                autoReconnectTime - time > 0 &&
                ` (${Math.ceil((autoReconnectTime - time) / 1000)}s)`}
            </Caption>
          </LoadingButton>
          <Button onClick={() => setCollaborationStoppedNoticeOpen(false)}>{t('buttons.ok')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CollaborativeExcalidrawWrapper;
