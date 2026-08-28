import type { AssetAdapter, ExcalidrawImperativeAPI, ExcalidrawProps } from '@excalidraw-yjs/excalidraw/types';
import { debounce, merge } from 'lodash-es';
import type React from 'react';
import { type PropsWithChildren, type Ref, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type TranslationKey from '@/core/i18n/utils/TranslationKey';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import { error as logError, TagCategoryValues } from '@/core/logging/sentry/log';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { Identifiable } from '@/core/utils/Identifiable';
import useOnlineStatus from '@/core/utils/onlineStatus';
import type { SessionEndCode } from '@/domain/collaboration/realTimeCollaboration/unifiedCollabProvider';
import { resolveWhiteboardGuestIdentity } from '@/domain/collaboration/whiteboard/guestAccess/utils/resolveWhiteboardGuestIdentity';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';
import { CollaboratorModeReasons } from './collab/excalidrawAppConstants';
import useCollab, { type CollabAPI, type CollabState } from './collab/useCollab';
import { generateIdFromFile } from './collab/utils';
import { getWhiteboardImageUploadI18nParams, validateWhiteboardImageFile } from './fileStore/fileValidation';
import useWhiteboardDefaults from './useWhiteboardDefaults';

const FILE_IMPORT_ENABLED = true;
const SAVE_FILE_TO_DISK = true;

/** Per-cause translated explanation shown when the server ends the session. */
const SESSION_END_MESSAGE_KEYS: Record<SessionEndCode, TranslationKey> = {
  'update-rate-exceeded': 'callout.whiteboard.session.rateExceeded',
  'update-not-accepted': 'callout.whiteboard.session.updateNotAccepted',
  'document-size-limit-exceeded': 'callout.whiteboard.session.sizeLimitExceeded',
  'document-deleted': 'callout.whiteboard.session.documentDeleted',
  'edits-not-saved': 'callout.whiteboard.session.editsNotSaved',
  'server-shutdown': 'callout.whiteboard.session.serverShutdown',
};

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

export type WhiteboardWhiteboardEntities = {
  whiteboard: (Identifiable & { profile?: { url?: string } }) | undefined;
  /** The asset boundary for image bytes — passed straight to `<Excalidraw assetAdapter>`. */
  assetAdapter: AssetAdapter;
  /** Image upload validation limits (from the whiteboard's storage bucket). */
  imageValidation?: { allowedMimeTypes?: string[]; maxFileSize?: number };
  lastSuccessfulSavedDate: Date | undefined;
};

export interface WhiteboardWhiteboardActions {
  onInitApi?: (excalidrawApi: ExcalidrawImperativeAPI) => void;
  onSceneInitChange?: (initialized: boolean) => void;
  onRemoteSave?: (error?: string) => void;
  /**
   * The current editor generation was DISCARDED (server update-rejected): its api is now
   * dead and a fresh generation will resync the server-canonical scene. A consumer that
   * captured the api for a pending save (e.g. flush-then-save on close) must abort — the
   * captured state is stale and would clobber the recovery.
   */
  onEditorInvalidated?: () => void;
}

export type WhiteboardWhiteboardEvents = {};

export interface WhiteboardWhiteboardOptions extends ExcalidrawProps {}

interface CollaborativeExcalidrawWrapperProvided extends CollabState {
  restartCollaboration: () => void;
  canReconnect: boolean;
}

/** State handed to a custom "collaboration stopped" notice renderer (see `renderDisconnectNotice`). */
export type DisconnectNoticeRenderProps = {
  open: boolean;
  isOnline: boolean;
  connecting: boolean;
  /**
   * Non-null when the room refused this collaboration attempt permanently. Consumers must
   * render an unavailable/access state and must not offer reconnect for these verdicts.
   * `document-size-limit-exceeded` is the one manual-recovery verdict: reconnect creates a
   * fresh editor generation after the rejected local generation is discarded.
   */
  terminalCloseReason: string | null;
  /** Kept for the presentational notice; provider retries do not expose a second countdown. */
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
  // The live editor api paired with the whiteboard id it was created under. `<Excalidraw>`
  // is keyed by whiteboard id, so an in-place id change A→B remounts the editor — but
  // `whiteboard.id` advances a render BEFORE editor B mounts and hands back its api, so for
  // one render the api would be editor A's while the room is already B. Storing the id WITH
  // the api (one state value, always consistent within a render) lets the init effect refuse
  // the `(editor A, room B)` combination structurally, instead of pushing scene A into room B.
  const [excalidrawApi, setExcalidrawApi] = useState<{
    api: ExcalidrawImperativeAPI;
    whiteboardId: string;
  } | null>(null);

  const [collaborationStartTime, setCollaborationStartTime] = useState<number | null>(Date.now());

  // Bumped when the server rejects this generation's local update. It participates in
  // the <Excalidraw> key so the poisoned generation is DISCARDED and a fresh Scene/Y.Doc
  // is mounted that resyncs from the server — the rejected local state can never be
  // resent (reconnecting the provider alone would reuse the poisoned scene).
  const [recoveryGeneration, setRecoveryGeneration] = useState(0);

  // Set by a MANUAL session-end (document-size-limit-exceeded): the current generation is
  // poisoned and torn down, and collaboration stays OFF until the user explicitly restarts.
  // That restart must mint a FRESH generation BEFORE reconnecting so the discarded doc is
  // never reconnected.
  const [manualDiscardPending, setManualDiscardPending] = useState(false);

  const [collaborationStoppedNoticeOpen, setCollaborationStoppedNoticeOpen] = useState(false);

  // Set to the server's close reason when the collaboration socket is closed with a
  // TERMINAL 1008 policy verdict (forbidden / document deleted / any unrecognised
  // reason, fail closed). It disables manual retry UI while the provider also keeps
  // its reconnect timer off. `null` for a transient drop. Cleared on an explicit
  // user reconnect or once collaboration is re-established.
  const [terminalCloseReason, setTerminalCloseReason] = useState<string | null>(null);

  const { whiteboard, assetAdapter, imageValidation, lastSuccessfulSavedDate } = entities;
  const previousWhiteboardIdRef = useRef(whiteboard?.id);

  const whiteboardDefaults = useWhiteboardDefaults();
  const { t } = useTranslation();
  const notify = useNotification();

  const combinedCollabApiRef = useCombinedRefs<CollabAPI | null>(null, collabApiRef);

  const { userModel } = useCurrentUserContext();
  const username = (() => {
    const { isPublicRoute, guestName } = resolveWhiteboardGuestIdentity();
    if (isPublicRoute) {
      // Public/guest whiteboard: broadcast the SAME validated guest identity the WS
      // handshake and asset-fetch header use — NEVER the authenticated user's real display
      // name (that would leak identity on a public link). A generic fallback covers a
      // missing/invalid guest name (fail closed).
      return guestName ?? t('common.guestUserFallback');
    }
    // Private route: the user is authenticated (identified by their session cookie), so
    // their real display name is shown on their cursor.
    return userModel?.profile?.displayName ?? t('common.guestUserFallback');
  })();

  const [isSceneInitialized, setSceneInitialized] = useState(false);

  // Keep useMemo: wraps debounce(). Without stable reference, debounce is recreated every render,
  // resetting the timer and breaking the scroll-listener cleanup in useEffect.
  const debouncedRefresh = useMemo(
    () =>
      debounce(async () => {
        excalidrawApi?.api.refresh();
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

  const { UIOptions: externalUIOptions, viewModeEnabled: externallyReadOnly, ...restOptions } = options;

  const mergedUIOptions = merge(UIOptions, externalUIOptions);

  const [
    collabApi,
    initializeCollab,
    {
      connecting,
      collaborating,
      mode,
      modeReason,
      isReadOnly,
      phase,
      access,
      hasEverSynced,
      hasUnconfirmedLocalChanges,
    },
  ] = useCollab({
    username,
    onRemoteSave: (error?: string) => actions.onRemoteSave?.(error),
    onCloseConnection: () => {
      // Established documents remain mounted while the provider's single retry
      // owner reconnects this same scene. Terminal/manual outcomes use the modal.
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
      // The server rejected this generation's update. Tell the user their last change
      // could not be saved, then discard the poisoned generation:
      // - Invalidate the API (`setExcalidrawApi(null)`): the initializeCollab effect
      //   depends on `excalidrawApi`, so nulling it forces that effect's CLEANUP to run
      //   NOW — destroying the old provider/socket immediately, independent of whether
      //   the replacement editor ever mounts (React runs an effect's cleanup before any
      //   next setup). Without this, the old socket would linger until the replacement
      //   happened to call onExcalidrawAPI — indefinitely if that replacement failed.
      // - Bump `recoveryGeneration` (in the <Excalidraw key>) so a fresh Scene/Y.Doc is
      //   mounted that resyncs the server's canonical state.
      // `onUpdateRejected` fires for ANY rejected server update (text/shape edits included), not
      // just image uploads — so the message must speak to the change not being saved, not "image
      // upload failed" (the old copy, which was misleading for non-image edits).
      notify(t('callout.whiteboard.session.updateRejected'), 'error');
      setSceneInitialized(false);
      setExcalidrawApi(null);
      setRecoveryGeneration(generation => generation + 1);
      // Tell consumers the editor generation was discarded, so a pending flush-then-save
      // on close aborts instead of persisting the dead editor's stale content.
      actions.onEditorInvalidated?.();
    },
    onTerminalClose: (reason: string) => {
      // A TERMINAL policy close: this attempt must not be retried. Record the reason
      // (the provider does not retry it) and surface the collaboration-stopped notice
      // WITHOUT a retry countdown — unlike a transient drop, the connection is
      // not coming back on its own.
      setTerminalCloseReason(reason);
      // A terminal refusal freezes editing, but a dirty scene must stay visible so
      // the existing Excalidraw export action remains usable. Do not cover that action
      // with the blocking unavailable dialog; the persistent dirty footer owns this
      // state. Clean terminal closes keep the established unavailable presentation.
      const dirty = !!combinedCollabApiRef.current?.hasUnconfirmedLocalChanges?.();
      setCollaborationStoppedNoticeOpen(!dirty);
      if (!dirty) setSceneInitialized(false);
      logError('WB Connection Closed (terminal policy close)', {
        category: TagCategoryValues.WHITEBOARD,
        label: `WB ID: ${whiteboard?.id}; URL: ${whiteboard?.profile?.url}; Reason: ${reason}`,
      });
    },
    onSessionEnd: ({ code, disposition }) => {
      // A code-specific, translated explanation for the user (edits-not-saved reads as a
      // data-loss warning, distinct from an ordinary deletion).
      notify(t(SESSION_END_MESSAGE_KEYS[code]), disposition === 'transient' ? 'info' : 'warning');
      if (disposition === 'transient') {
        // The provider owns retry. Established scenes surface recovery in the
        // footer without blocking or replacing the editor.
        return;
      }
      if (disposition === 'manual') {
        // Discard/tear down the poisoned generation NOW: nulling the api runs the init
        // effect's cleanup → the provider/socket is destroyed immediately, even if no
        // replacement editor mounts. Keep collaboration init and provider reconnect OFF
        // (collaborationStartTime=null disables init; a 1008 close never reconnects the provider) until the user
        // explicitly restarts — which mints a FRESH generation first (see restartCollaboration).
        setSceneInitialized(false);
        setExcalidrawApi(null);
        setCollaborationStartTime(null);
        setTerminalCloseReason(code);
        setManualDiscardPending(true);
        setCollaborationStoppedNoticeOpen(true);
        actions.onEditorInvalidated?.();
        return;
      }
      // terminal (document-deleted / edits-not-saved): no reconnect; surface the notice.
      setTerminalCloseReason(code);
      const dirty = !!combinedCollabApiRef.current?.hasUnconfirmedLocalChanges?.();
      setCollaborationStoppedNoticeOpen(!dirty);
      if (!dirty) setSceneInitialized(false);
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

  /**
   * Validate a dropped/pasted image, then return a content-hash id for it. Text
   * and shapes can recover through Yjs while disconnected; image bytes cannot,
   * so insertion is refused at the source during transient recovery.
   */
  const handleGenerateIdForFile = async (file: File): Promise<string> => {
    if (phase === 'recovering') {
      const message = t('callout.whiteboard.images.uploadFailed');
      notify(message, 'warning');
      throw new Error(message);
    }
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

  const restartCollaboration = () => {
    if (manualDiscardPending) {
      // Recovering from a MANUAL session-end (size-limit): mint a FRESH generation BEFORE
      // reconnecting, so the discarded/poisoned doc is never reconnected. The new editor
      // mounts, hands back its api, and (with collaborationStartTime set below) connects clean.
      setRecoveryGeneration(generation => generation + 1);
      setManualDiscardPending(false);
    }
    // An explicit user reconnect clears the terminal verdict. Ordinary transport
    // recovery retries the SAME provider/Y.Doc. An inactivity downgrade is
    // different: its socket is still OPEN and the server member is deliberately a
    // viewer, so reconnect() would correctly no-op. Re-run the binding lifecycle to
    // destroy that member and join afresh only after the user explicitly asks to
    // resume editing (automatic rejoin would defeat the inactivity policy).
    setTerminalCloseReason(null);
    if (manualDiscardPending || !collabApi) {
      setCollaborationStartTime(Date.now());
    } else if (mode === 'read' && modeReason === CollaboratorModeReasons.INACTIVITY) {
      setCollaborationStartTime(generation => (generation ?? 0) + 1);
    } else {
      collabApi.reconnect();
    }
  };

  useEffect(() => {
    if (phase === 'live') {
      setCollaborationStoppedNoticeOpen(false);
      // Collaboration is live again — drop any terminal verdict so a later drop is
      // classified fresh.
      setTerminalCloseReason(null);
    }
  }, [phase]);

  useEffect(() => {
    // Only initialize when the live api actually belongs to THIS whiteboard — never the
    // just-unmounting editor of the previous id (which would drive a provider for the new
    // room with the old editor's scene port and push its scene into the new room). The id
    // is stored alongside the api, so this pair is always self-consistent within a render.
    if (
      excalidrawApi &&
      whiteboard?.id &&
      excalidrawApi.whiteboardId === whiteboard.id &&
      collaborationStartTime !== null
    ) {
      return initializeCollab({
        excalidrawApi: excalidrawApi.api,
        roomId: whiteboard.id,
      });
    }
  }, [excalidrawApi, whiteboard?.id, collaborationStartTime]);

  const handleInitializeApi = (api: ExcalidrawImperativeAPI | null) => {
    if (!api) return;
    // The keyed editor for a new whiteboard can publish its API before a passive
    // parent effect runs. Invalidate the old generation synchronously here, then
    // publish the new API, so the invalidation can never clear the replacement.
    if (previousWhiteboardIdRef.current !== whiteboard?.id) {
      actions.onEditorInvalidated?.();
      previousWhiteboardIdRef.current = whiteboard?.id;
    }
    // Pair the api with the whiteboard it was created under (the editor mounted under the
    // current, keyed whiteboard id), so the init effect can require a match.
    setExcalidrawApi({ api, whiteboardId: whiteboard?.id ?? '' });
    actions.onInitApi?.(api);
  };

  const children = (
    <div style={{ height: '100%', flexGrow: 1, position: 'relative' }}>
      <Suspense fallback={<Loading />}>
        <LoadingScene enabled={phase === 'initial' || !isSceneInitialized} />
        {whiteboard && (
          <Excalidraw
            // Keyed by whiteboard id AND recovery generation: a new whiteboard OR an
            // `update-rejected` recovery mounts a fresh Excalidraw (a fresh Scene/Y.Doc).
            key={`${whiteboard.id}:${recoveryGeneration}`}
            onExcalidrawAPI={handleInitializeApi}
            initialData={whiteboardDefaults}
            UIOptions={mergedUIOptions}
            isCollaborating={collaborating}
            viewModeEnabled={isReadOnly || externallyReadOnly}
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
        phase,
        access,
        hasEverSynced,
        hasUnconfirmedLocalChanges,
        restartCollaboration,
        // Ordinary transport recovery has its own non-blocking Retry-now action.
        // This legacy/manual affordance is reserved for the discarded size-limit
        // generation; inactivity is derived independently from modeReason.
        canReconnect: isOnline && manualDiscardPending,
        isReadOnly,
      })}
      {renderDisconnectNotice({
        open: collaborationStoppedNoticeOpen,
        isOnline,
        connecting,
        terminalCloseReason,
        autoReconnectSeconds: null,
        lastSuccessfulSavedDate,
        onReconnect: restartCollaboration,
        onClose: () => setCollaborationStoppedNoticeOpen(false),
      })}
    </>
  );
};

export default CollaborativeExcalidrawWrapper;
