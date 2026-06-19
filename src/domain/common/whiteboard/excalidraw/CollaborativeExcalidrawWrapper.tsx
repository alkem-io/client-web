import type { OrderedExcalidrawElement } from '@alkemio/excalidraw/dist/types/element/src/types';
import type {
  AppState,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
} from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { Box, Button, DialogActions, DialogContent } from '@mui/material';
import Dialog from '@mui/material/Dialog';
import { debounce, merge } from 'lodash-es';
import type React from 'react';
import { type PropsWithChildren, type Ref, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { error as logError, TagCategoryValues } from '@/core/logging/sentry/log';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import Loading from '@/core/ui/loading/Loading';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { Caption, Text } from '@/core/ui/typography';
import type { Identifiable } from '@/core/utils/Identifiable';
import useOnlineStatus from '@/core/utils/onlineStatus';
import { getGuestName } from '@/domain/collaboration/whiteboard/guestAccess/utils/sessionStorage';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';
import { useWhiteboardCollab } from './collab/unified/useWhiteboardCollab';
import type { CollabAPI, CollabState } from './collab/useCollab';
import { getWhiteboardImageUploadI18nParams } from './fileStore/fileValidation';
import { useAutoReconnect } from './useAutoReconnect';
import useWhiteboardDefaults from './useWhiteboardDefaults';
import type { WhiteboardFilesManager } from './useWhiteboardFilesManager';

const FILE_IMPORT_ENABLED = true;
const SAVE_FILE_TO_DISK = true;

const Excalidraw = lazyWithGlobalErrorHandler(async () => {
  const { Excalidraw } = await import('@alkemio/excalidraw');
  await import('@alkemio/excalidraw/index.css');
  await import('./styles/excalidraw-overrides.css');
  return { default: Excalidraw };
});

const LoadingScene = ({ enabled }: { enabled: boolean }) => {
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
};

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

export type WhiteboardWhiteboardEvents = {};

export interface WhiteboardWhiteboardOptions extends ExcalidrawProps {}

interface CollaborativeExcalidrawWrapperProvided extends CollabState {
  restartCollaboration: () => void;
}

/** State handed to a custom "collaboration stopped" notice renderer (see `renderDisconnectNotice`). */
export type DisconnectNoticeRenderProps = {
  open: boolean;
  isOnline: boolean;
  connecting: boolean;
  /** Seconds until auto-reconnect, or `null` when no countdown is active (offline / not scheduled). */
  autoReconnectSeconds: number | null;
  lastSuccessfulSavedDate: Date | undefined;
  onReconnect: () => void;
  onClose: () => void;
};

export interface WhiteboardWhiteboardProps {
  entities: WhiteboardWhiteboardEntities;
  options: WhiteboardWhiteboardOptions;
  actions: WhiteboardWhiteboardActions;
  events?: WhiteboardWhiteboardEvents;
  collabApiRef?: Ref<CollabAPI | null>;
  children: (props: PropsWithChildren<CollaborativeExcalidrawWrapperProvided>) => React.ReactNode;
  /**
   * Optional render-prop for the "collaboration stopped" notice. When provided (CRD consumers), it
   * replaces the built-in MUI dialog so the notice renders with CRD chrome. MUI consumers omit it and
   * keep the built-in MUI dialog. The wrapper still owns all the notice state (open, countdown,
   * reconnect) and hands it to the renderer.
   */
  renderDisconnectNotice?: (props: DisconnectNoticeRenderProps) => React.ReactNode;
}

const WINDOW_SCROLL_HANDLER_DEBOUNCE_INTERVAL = 100;

const CollaborativeExcalidrawWrapper = ({
  entities,
  actions,
  options,
  collabApiRef,
  children: renderChildren,
  renderDisconnectNotice,
}: WhiteboardWhiteboardProps) => {
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);

  const [collaborationStartTime, setCollaborationStartTime] = useState<number | null>(Date.now());

  const [collaborationStoppedNoticeOpen, setCollaborationStoppedNoticeOpen] = useState(false);

  const { whiteboard, filesManager, lastSuccessfulSavedDate } = entities;
  const whiteboardDefaults = useWhiteboardDefaults();
  const { t } = useTranslation();
  const notify = useNotification();

  /**
   * Validate file before adding to whiteboard.
   * Rejects invalid files with a user-visible notification.
   */
  const handleGenerateIdForFile = async (file: File): Promise<string> => {
    const validation = filesManager.validateFile(file);
    if (!validation.ok) {
      const maxSizeFallback = t('callout.whiteboard.images.maxSizeFallback');
      const params = getWhiteboardImageUploadI18nParams(validation, maxSizeFallback);
      const message: string =
        validation.reason === 'unsupportedMimeType'
          ? t('callout.whiteboard.images.unsupportedType', params)
          : t('callout.whiteboard.images.tooLarge', params);
      notify(message, 'error');
      throw new Error(message);
    }
    return filesManager.addNewFile(file);
  };

  const combinedCollabApiRef = useCombinedRefs<CollabAPI | null>(null, collabApiRef);

  const { userModel } = useCurrentUserContext();
  const username = (() => {
    if (userModel?.profile?.displayName) {
      return userModel.profile.displayName;
    }

    const guestName = getGuestName() ?? t('common.guestUserFallback', { defaultValue: 'User' });
    const guestSuffix = t('common.guestSuffix');
    return guestSuffix ? `${guestName} ${guestSuffix}` : guestName;
    // getGuestName() is intentionally omitted from dependencies - guest names are set once per session
    // and don't change dynamically. Including it would cause unnecessary re-renders without benefit.
  })();

  const [isSceneInitialized, setSceneInitialized] = useState(false);

  // Keep useMemo: wraps debounce(). Without stable reference, debounce is recreated every render,
  // resetting the timer and breaking the scroll-listener cleanup in useEffect.
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

  const UIOptions: ExcalidrawProps['UIOptions'] = {
    canvasActions: {
      loadScene: FILE_IMPORT_ENABLED,
      export: {
        saveFileToDisk: SAVE_FILE_TO_DISK,
      },
    },
  };

  const { UIOptions: externalUIOptions, ...restOptions } = options;

  const mergedUIOptions = merge(UIOptions, externalUIOptions);

  const isOnline = useOnlineStatus();

  const restartCollaboration = () => {
    setCollaborationStartTime(Date.now());
  };

  // Unified collaboration (WS-D): the per-property Yjs scene binding over the
  // unified collaboration-service, replacing the legacy socket.io Collab/Portal.
  // `collaborationStartTime` keys the whiteboard id so a restart mounts a fresh
  // provider + Y.Doc (the reconnect path the disconnect notice drives).
  const collabWhiteboardId = whiteboard?.id && collaborationStartTime !== null ? whiteboard.id : undefined;

  const [whiteboardCollab, collabState] = useWhiteboardCollab({
    whiteboardId: collabWhiteboardId,
    user: { id: userModel?.id, username, color: undefined, avatarUrl: userModel?.profile?.avatar?.uri },
    guestName: getGuestName() ?? undefined,
    onRemoteSave: (error?: string) => actions.onRemoteSave?.(error),
    onCloseConnection: () => {
      setCollaborationStoppedNoticeOpen(true);
      setSceneInitialized(false);
      // The auto-reconnect countdown is driven by `useAutoReconnect` off the notice-open + connecting
      // state below — no need to schedule anything from here.
      logError('WB Connection Closed', {
        category: TagCategoryValues.WHITEBOARD,
        label: `WB ID: ${whiteboard?.id}; URL: ${whiteboard?.profile?.url}; Online: ${isOnline}`,
      });
    },
  });

  // Adapt the unified hook state to the wrapper's existing CollabState surface
  // (consumed by WhiteboardDialog's render-prop + headerActions, unchanged).
  const connecting = collabState.status === 'connecting';
  const collaborating = collabState.status === 'connected' && collabState.synced;
  const mode: CollabState['mode'] = collabState.mode;
  const modeReason: CollabState['modeReason'] = null;
  const isReadOnly = collabState.isReadOnly;

  // The binding owns scene↔doc sync internally (it subscribes to the editor's
  // onChange). Once the scene has loaded via the y-protocols sync handshake, mark
  // it initialized so the loading overlay clears.
  useEffect(() => {
    const initialized = collaborating;
    setSceneInitialized(initialized);
    actions.onSceneInitChange?.(initialized);
  }, [collaborating]);

  // CollabAPI shim for combinedCollabApiRef (WhiteboardDialog calls isCollaborating()).
  // Scene propagation is now owned by the Yjs binding, so `syncScene` is a no-op;
  // cursor presence routes through the binding's awareness via the unified hook.
  // Depends on the hook's stable callbacks, not the per-render `whiteboardCollab`.
  const { onPointerUpdate, broadcastEmojiReaction, broadcastCountdownTimer } = whiteboardCollab;
  const collabApi: CollabAPI = useMemo(
    () =>
      ({
        onPointerUpdate: (payload: {
          pointer: { x: number; y: number; tool?: 'pointer' | 'laser' };
          button: 'down' | 'up';
        }) => onPointerUpdate({ pointer: payload.pointer, button: payload.button }),
        syncScene: async () => {},
        isCollaborating: () => collaborating,
        broadcastEmojiReaction,
        broadcastCountdownTimer,
      }) as unknown as CollabAPI,
    [onPointerUpdate, broadcastEmojiReaction, broadcastCountdownTimer, collaborating]
  );

  useEffect(() => {
    // eslint-disable-next-line react-compiler/react-compiler -- ref mutation from useCombinedRefs; compiler cannot infer mutability
    combinedCollabApiRef.current = collabApi;
  }, [collabApi]);

  // Handler for broadcasting emoji reactions to collaborators
  const handleRequestBroadcastEmojiReaction = (emoji: string, x: number, y: number) => {
    return collabApi?.broadcastEmojiReaction?.(emoji, x, y);
  };

  // Handler for broadcasting Countdown Timer to collaborators
  const handleRequestBroadcastCountdownTimer = (remainingSeconds: number, startedBy: string, active: boolean) => {
    return collabApi?.broadcastCountdownTimer?.(remainingSeconds, startedBy, active);
  };

  // The Yjs binding propagates element changes; the wrapper's onChange only needs
  // to upload any new local files so the binding can sync their descriptors.
  const onChange = async (_elements: readonly OrderedExcalidrawElement[], _appState: AppState, files: BinaryFiles) => {
    if (isReadOnly) {
      return;
    }
    await filesManager.getUploadedFiles(files);
  };

  // Single source of truth for the reconnect countdown + backoff (5s → 10s → 30s → 60s…). It counts
  // down while the notice is open and we're not yet collaborating, fires `restartCollaboration` at
  // zero, and resets once the connection is restored.
  const { secondsRemaining: autoReconnectSeconds } = useAutoReconnect({
    active: collaborationStoppedNoticeOpen && !collaborating,
    isOnline,
    connecting,
    onReconnect: restartCollaboration,
  });

  useEffect(() => {
    if (!connecting && collaborating) {
      setCollaborationStoppedNoticeOpen(false);
    }
  }, [connecting, collaborating]);

  // Wire the Excalidraw imperative API into the unified collab binding (and tear
  // it down on unmount via the null call). Effect-driven so the binding is created
  // once the API + a live provider exist, and disposed on whiteboard change. Depends
  // on the stable `onExcalidrawAPI` callback (it changes only when the provider/doc
  // does), not the whole `whiteboardCollab` object (rebuilt every render).
  const bindExcalidrawApi = whiteboardCollab.onExcalidrawAPI;
  useEffect(() => {
    if (!excalidrawApi) {
      return;
    }
    bindExcalidrawApi(excalidrawApi);
    return () => {
      bindExcalidrawApi(null);
    };
  }, [excalidrawApi, bindExcalidrawApi]);

  const handleInitializeApi = (excalidrawApi: ExcalidrawImperativeAPI) => {
    setExcalidrawApi(excalidrawApi);
    actions.onInitApi?.(excalidrawApi);
  };

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
            viewModeEnabled={isReadOnly}
            onChange={onChange}
            onPointerUpdate={collabApi?.onPointerUpdate}
            onRequestBroadcastEmojiReaction={handleRequestBroadcastEmojiReaction}
            onRequestBroadcastCountdownTimer={handleRequestBroadcastCountdownTimer}
            detectScroll={false}
            autoFocus={true}
            generateIdForFile={handleGenerateIdForFile}
            aiEnabled={false}
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
        isReadOnly,
      })}
      {renderDisconnectNotice ? (
        renderDisconnectNotice({
          open: collaborationStoppedNoticeOpen,
          isOnline,
          connecting,
          autoReconnectSeconds,
          lastSuccessfulSavedDate,
          onReconnect: restartCollaboration,
          onClose: () => setCollaborationStoppedNoticeOpen(false),
        })
      ) : (
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
              {t('pages.whiteboard.whiteboardDisconnected.reconnect')}
              <Caption textTransform="none">
                {autoReconnectSeconds !== null &&
                  ` ${t('pages.whiteboard.whiteboardDisconnected.reconnectCountdown', {
                    seconds: autoReconnectSeconds,
                  })}`}
              </Caption>
            </Button>
            <Button onClick={() => setCollaborationStoppedNoticeOpen(false)}>{t('buttons.ok')}</Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

export default CollaborativeExcalidrawWrapper;
