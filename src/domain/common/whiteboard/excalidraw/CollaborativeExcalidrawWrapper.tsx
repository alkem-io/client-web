import type {
  AssetAdapter,
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
} from '@excalidraw-yjs/excalidraw/dist/types/excalidraw/types';
import { debounce, merge } from 'lodash-es';
import type React from 'react';
import { type PropsWithChildren, type Ref, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { error as logError, TagCategoryValues } from '@/core/logging/sentry/log';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { Identifiable } from '@/core/utils/Identifiable';
import useOnlineStatus from '@/core/utils/onlineStatus';
import { getGuestName } from '@/domain/collaboration/whiteboard/guestAccess/utils/sessionStorage';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';
import useCollab, { type CollabAPI, type CollabState } from './collab/useCollab';
import { generateIdFromFile } from './collab/utils';
import { getWhiteboardImageUploadI18nParams, validateWhiteboardImageFile } from './fileStore/fileValidation';
import { useAutoReconnect } from './useAutoReconnect';
import useWhiteboardDefaults from './useWhiteboardDefaults';

const FILE_IMPORT_ENABLED = true;
const SAVE_FILE_TO_DISK = true;

const Excalidraw = lazyWithGlobalErrorHandler(async () => {
  const { Excalidraw } = await import('@excalidraw-yjs/excalidraw');
  await import('@excalidraw-yjs/excalidraw/index.css');
  await import('./styles/excalidraw-overrides.css');
  return { default: Excalidraw };
});

const LoadingScene = ({ enabled }: { enabled: boolean }) => {
  const { t } = useTranslation();

  return enabled ? (
    <div
      style={{
        position: 'absolute',
        width: '100%',
        height: '100%',
        zIndex: 1302,
        backgroundColor: '#FFFFFF',
      }}
    >
      <Loading text={t('pages.whiteboard.loadingScene')} />
    </div>
  ) : null;
};

export interface WhiteboardWhiteboardEntities {
  whiteboard: (Identifiable & { profile?: { url?: string } }) | undefined;
  /** The asset boundary for image bytes — passed straight to `<Excalidraw assetAdapter>`. */
  assetAdapter: AssetAdapter;
  /** Image upload validation limits (from the whiteboard's storage bucket). */
  imageValidation?: { allowedMimeTypes?: string[]; maxFileSize?: number };
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
   * Render-prop for the "collaboration stopped" notice. The wrapper owns all the notice state
   * (open, countdown, reconnect) and hands it to the renderer, which supplies the chrome (the CRD
   * `WhiteboardDisconnectedDialog`).
   */
  renderDisconnectNotice: (props: DisconnectNoticeRenderProps) => React.ReactNode;
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

  // Bumped when the server rejects this generation's local update. It participates in
  // the <Excalidraw> key so the poisoned generation is DISCARDED and a fresh Scene/Y.Doc
  // is mounted that resyncs from the server — the rejected local state can never be
  // resent (reconnecting the provider alone would reuse the poisoned scene).
  const [recoveryGeneration, setRecoveryGeneration] = useState(0);

  const [collaborationStoppedNoticeOpen, setCollaborationStoppedNoticeOpen] = useState(false);

  const { whiteboard, assetAdapter, imageValidation, lastSuccessfulSavedDate } = entities;
  const whiteboardDefaults = useWhiteboardDefaults();
  const { t } = useTranslation();
  const notify = useNotification();

  /**
   * Validate a dropped/pasted image, then return a content-hash id for it. The
   * editor holds the bytes in its own file store and publishes them through
   * `assetAdapter.store`; a rejected file surfaces a user-visible notification.
   */
  const handleGenerateIdForFile = async (file: File): Promise<string> => {
    const validation = validateWhiteboardImageFile(file, {
      allowedMimeTypes: imageValidation?.allowedMimeTypes,
      maxFileSizeBytes: imageValidation?.maxFileSize,
    });
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
    return generateIdFromFile(file);
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

  const [collabApi, initializeCollab, { connecting, collaborating, mode, modeReason, isReadOnly }] = useCollab({
    username,
    onRemoteSave: (error?: string) => actions.onRemoteSave?.(error),
    onCloseConnection: () => {
      setCollaborationStoppedNoticeOpen(true);
      setSceneInitialized(false);
      // The auto-reconnect countdown is driven by `useAutoReconnect` off the notice-open + connecting
      // state below — no need to schedule anything from here.
      // event if it's duplicated by the httpLink and Portal handlers, let's log this closeConnection one
      // with additional info here #7492
      logError('WB Connection Closed', {
        category: TagCategoryValues.WHITEBOARD,
        label: `WB ID: ${whiteboard?.id}; URL: ${whiteboard?.profile?.url}; Online: ${isOnline}`,
      });
    },
    onSceneInitChange: (initialized: boolean) => {
      setSceneInitialized(initialized);
      actions.onSceneInitChange?.(initialized);
    },
    onUpdateRejected: () => {
      // The server rejected this generation's update. Bump the recovery generation so
      // <Excalidraw> remounts with a fresh scene that resyncs from the server, and tell
      // the user their last change could not be saved.
      notify(t('callout.whiteboard.images.uploadFailed'), 'error');
      setRecoveryGeneration(generation => generation + 1);
    },
  });

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

  const isOnline = useOnlineStatus();

  const restartCollaboration = () => {
    setCollaborationStartTime(Date.now());
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

  useEffect(() => {
    if (excalidrawApi && whiteboard?.id && collaborationStartTime !== null) {
      return initializeCollab({
        excalidrawApi,
        roomId: whiteboard.id,
      });
    }
  }, [excalidrawApi, whiteboard?.id, collaborationStartTime]);

  const handleInitializeApi = (excalidrawApi: ExcalidrawImperativeAPI | null) => {
    if (!excalidrawApi) return;
    setExcalidrawApi(excalidrawApi);
    actions.onInitApi?.(excalidrawApi);
  };

  const children = (
    <div style={{ height: '100%', flexGrow: 1, position: 'relative' }}>
      <Suspense fallback={<Loading />}>
        <LoadingScene enabled={!isSceneInitialized} />
        {whiteboard && (
          <Excalidraw
            // Keyed by whiteboard id AND recovery generation: a new whiteboard OR an
            // `update-rejected` recovery mounts a fresh Excalidraw (a fresh Scene/Y.Doc).
            key={`${whiteboard.id}:${recoveryGeneration}`}
            onExcalidrawAPI={handleInitializeApi}
            initialData={whiteboardDefaults}
            UIOptions={mergedUIOptions}
            isCollaborating={collaborating}
            viewModeEnabled={isReadOnly}
            assetAdapter={assetAdapter}
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
        isReadOnly,
      })}
      {renderDisconnectNotice({
        open: collaborationStoppedNoticeOpen,
        isOnline,
        connecting,
        autoReconnectSeconds,
        lastSuccessfulSavedDate,
        onReconnect: restartCollaboration,
        onClose: () => setCollaborationStoppedNoticeOpen(false),
      })}
    </>
  );
};

export default CollaborativeExcalidrawWrapper;
