import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
} from '@alkemio/excalidraw/dist/excalidraw/types';
import type { OrderedExcalidrawElement } from '@alkemio/excalidraw/dist/excalidraw/element/types';
import { makeStyles } from '@mui/styles';
import { debounce, DebouncedFunc, merge } from 'lodash';
import React, {
  MutableRefObject,
  PropsWithChildren,
  Ref,
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
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
import { TagCategoryValues, error as logError } from '@/core/logging/sentry/log';

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
  whiteboard: (Identifiable & { profile?: { url?: string } }) | undefined;
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

  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);

  // @@@ WIP ~ #7611
  // ------------------------------------------------------------------------------------------------------------------
  /**
   * 	Key Observations and Adjustments:
   *
   * 	excalidrawApi Availability: We are correctly using useState to manage the excalidrawApi, and it's initialized asynchronously within the handleInitializeApi callback. This means the excalidrawApi might not be immediately available when the component mounts.
   *
   * 	handleScroll Purpose: Our handleScroll function calls excalidrawApi?.refresh(). It's important to understand why we're calling refresh(). Based on the Excalidraw documentation, refresh() is typically used to re-render the Excalidraw component when its container size changes or when something else outside of Excalidraw's internal state affects its rendering. If we're calling it solely on window scroll, we should carefully consider whether it's actually necessary for our use case. Frequent calls to refresh() can impact performance.
   *
   * 	Collab API Integration: The collabApi and its onPointerUpdate function are passed to Excalidraw. This is good.
   *
   * 	whiteboard Key: We are correctly using the whiteboard.id as the key to the <Excalidraw> component, forcing a re-render when the whiteboard changes.
   *
   * 	Dependency Array Updates: We now pass excalidrawApi to the debounced function. So excalidrawApi becomes important dependency in the useEffect.
   */

  const debouncedRefresh = useRef<DebouncedFunc<() => void> | null>(null) as MutableRefObject<DebouncedFunc<
    () => void
  > | null>; // Explicitly cast to MutableRefObject

  useEffect(() => {
    debouncedRefresh.current = debounce(() => {
      if (excalidrawApi) {
        excalidrawApi.refresh();
      } else {
        console.warn('excalidrawApi is not available.');
      }
    }, WINDOW_SCROLL_HANDLER_DEBOUNCE_INTERVAL);

    const handleScroll = () => {
      debouncedRefresh.current?.();
    };

    window.addEventListener('scroll', handleScroll, { passive: true, capture: true });

    return () => {
      debouncedRefresh.current?.cancel();
      window.removeEventListener('scroll', handleScroll, { capture: true });
    };
  }, [excalidrawApi]);

  /**
   * Key Changes and Reasoning:
   *
   * excalidrawApi in Dependency Array: The useEffect hook for handleScroll now includes excalidrawApi in its dependency array: useEffect(() => { ... }, [excalidrawApi]);. This is essential because the debounce callback depends on excalidrawApi. If excalidrawApi changes (i.e., it's initially null and then becomes an object), the useEffect should re-run to create a new debounced function that uses the updated excalidrawApi.
   *
   * debouncedRefresh useRef: The debouncedRefresh variable is now a useRef to persist the debounced function across re-renders, initialized in each useEffect callback.
   *
   * Removed useCallback for HandleScroll: handleScroll is not being used as dependency. Also, in the useEffect it is correctly attached and removed.
   *
   * Careful Handling of excalidrawApi Undefined: The debounced function now includes a conditional check: if (excalidrawApi) { excalidrawApi.refresh(); } else { console.warn("excalidrawApi is not yet available to refresh."); }. This handles the case where the API is not immediately available.
   *
   * Passive and Capture: The passive: true, capture: true options remain in the addEventListener call for performance and robustness.
   *
   * Important Questions to Consider:
   *
   * Why refresh() on Scroll? Reiterate whether you truly need to call excalidrawApi.refresh() on every scroll event. If the Excalidraw component is correctly handling resizing and re-rendering itself based on its container size, this might be unnecessary and detrimental to performance. Consider profiling your application to see if this scroll handler is causing performance bottlenecks. Alternative approaches might involve:
   *
   * Resizing Observer: Using a ResizeObserver to detect changes in the size of the Excalidraw container and calling refresh() only when the container size changes. This is a more targeted approach.
   *
   * Debouncing Resizes: If the container size changes frequently (e.g., due to responsive layout changes), debounce the resize handler instead of the scroll handler.
   *
   * Alternative Event: Is the intention of the original code to "refresh" the excalidraw on container/viewport size change (and not scroll)?
   *
   *
   *
   * In Summary:
   *
   * The revised code addresses the potential issues in the original snippet within the context of our component. However, the need for calling excalidrawApi.refresh() on every scroll event should be carefully evaluated, as it might not be the most efficient approach. Consider using a ResizeObserver or debouncing resize events instead if the goal is to re-render Excalidraw when its container size changes.
   *
   *
   */
  // ------------------------------------------------------------------------------------------------------------------

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
