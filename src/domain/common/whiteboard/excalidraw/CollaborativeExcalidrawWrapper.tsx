import React, { PropsWithChildren, Ref, Suspense, useCallback, useEffect, useMemo, useState } from 'react';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Loading from '@/core/ui/loading/Loading';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { Caption, Text } from '@/core/ui/typography';
import { Identifiable } from '@/core/utils/Identifiable';
import useOnlineStatus from '@/core/utils/onlineStatus';
import Reconnectable from '@/core/utils/reconnectable';
import { useTick } from '@/core/utils/time/tick';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';
import type { OrderedExcalidrawElement } from '@alkemio/excalidraw/dist/types/element/src/types';
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
} from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { Box, Button, DialogActions, DialogContent } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { debounce, merge } from 'lodash';
import { useTranslation } from 'react-i18next';
import useCollab, { CollabAPI, CollabState } from './collab/useCollab';
import useWhiteboardDefaults from './useWhiteboardDefaults';
import { WhiteboardFilesManager } from './useWhiteboardFilesManager';
import { TagCategoryValues, error as logError } from '@/core/logging/sentry/log';
import { getGuestName } from '@/domain/collaboration/whiteboard/guestAccess/utils/sessionStorage';

const FILE_IMPORT_ENABLED = true;
const SAVE_FILE_TO_DISK = true;

const Excalidraw = lazyWithGlobalErrorHandler(async () => {
  const { Excalidraw } = await import('@alkemio/excalidraw');
  await import('@alkemio/excalidraw/index.css');
  await import('./styles/excalidraw-overrides.css');
  return { default: Excalidraw };
});

const LoadingScene = React.memo(({ enabled }: { enabled: boolean }) => {
  const { t } = useTranslation();

  return enabled ? (
    <Box
      sx={theme => ({
        position: 'absolute',
        width: 1,
        height: 1,
        zIndex: `${theme.zIndex.modal + 2} !important`,
        backgroundColor: theme.palette.background.paper,
      })}
    >
      <Loading text={t('pages.whiteboard.loadingScene')} />
    </Box>
  ) : null;
});

export interface WhiteboardWhiteboardEntities {
  whiteboard: (Identifiable & { profile?: { url?: string } }) | undefined;
  filesManager: WhiteboardFilesManager;
  lastSuccessfulSavedDate: Date | undefined;
}

export interface WhiteboardWhiteboardActions {
  onInitApi?: (excalidrawApi: ExcalidrawImperativeAPI) => void;
  onSceneInitChange?: (initialized: boolean) => void;
  onRemoteSave?: (error?: string) => void;
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
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);

  const [collaborationStartTime, setCollaborationStartTime] = useState<number | null>(Date.now());

  const [collaborationStoppedNoticeOpen, setCollaborationStoppedNoticeOpen] = useState(false);

  const { whiteboard, filesManager, lastSuccessfulSavedDate } = entities;
  const whiteboardDefaults = useWhiteboardDefaults();
  const { t } = useTranslation();

  const combinedCollabApiRef = useCombinedRefs<CollabAPI | null>(null, collabApiRef);

  const { userModel } = useCurrentUserContext();
  const username = useMemo(() => {
    if (userModel?.profile.displayName) {
      return userModel.profile.displayName;
    }

    const guestName = getGuestName() ?? t('common.guestUserFallback', { defaultValue: 'User' });
    const guestSuffix = t('common.guestSuffix');
    return guestSuffix ? `${guestName} ${guestSuffix}` : guestName;
    // getGuestName() is intentionally omitted from dependencies - guest names are set once per session
    // and don't change dynamically. Including it would cause unnecessary re-renders without benefit.
  }, [t, userModel?.profile.displayName]);

  const [isSceneInitialized, setSceneInitialized] = useState(false);

  const debouncedRefresh = useMemo(
    () =>
      debounce(async () => {
        excalidrawApi?.refresh();
      }, WINDOW_SCROLL_HANDLER_DEBOUNCE_INTERVAL),
    [excalidrawApi]
  );

  useEffect(() => {
    window.addEventListener('scroll', debouncedRefresh, true);

    return () => {
      debouncedRefresh.cancel();
      window.removeEventListener('scroll', debouncedRefresh, true);
    };
  }, [debouncedRefresh]);

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
    onRemoteSave: (error?: string) => actions.onRemoteSave?.(error),
    onCloseConnection: () => {
      setCollaborationStoppedNoticeOpen(true);
      setSceneInitialized(false);
      if (isOnline) {
        setupReconnectTimeout();
      }
      // event if it's duplicated by the httpLink and Portal handlers, let's log this closeConnection one
      // with additional info here #7492
      logError('WB Connection Closed', {
        category: TagCategoryValues.WHITEBOARD,
        label: `WB ID: ${whiteboard?.id}; URL: ${whiteboard?.profile?.url}; Online: ${isOnline}`,
      });
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

  const children = (
    <Box sx={{ height: 1, flexGrow: 1, position: 'relative' }}>
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
    </Box>
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
          {lastSuccessfulSavedDate && (
            <Text>
              {t('pages.whiteboard.whiteboardDisconnected.lastSaved', {
                lastSaved: formatTimeElapsed(lastSuccessfulSavedDate, t, 'long'),
              })}
            </Text>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={restartCollaboration} disabled={!isOnline} loading={connecting}>
            Reconnect
            <Caption textTransform="none">
              {autoReconnectTime !== null &&
                autoReconnectTime - time > 0 &&
                ` (${Math.ceil((autoReconnectTime - time) / 1000)}s)`}
            </Caption>
          </Button>
          <Button onClick={() => setCollaborationStoppedNoticeOpen(false)}>{t('buttons.ok')}</Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CollaborativeExcalidrawWrapper;
