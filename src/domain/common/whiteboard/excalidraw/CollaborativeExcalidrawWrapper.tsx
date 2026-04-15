import type { ExcalidrawTextElement, OrderedExcalidrawElement } from '@alkemio/excalidraw/dist/types/element/src/types';
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
import { type PropsWithChildren, type Ref, Suspense, useEffect, useMemo, useRef, useState } from 'react';
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
import Reconnectable from '@/core/utils/reconnectable';
import { useTick } from '@/core/utils/time/tick';
import { getGuestName } from '@/domain/collaboration/whiteboard/guestAccess/utils/sessionStorage';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';
import useCollab, { type CollabAPI, type CollabState } from './collab/useCollab';
import { getWhiteboardImageUploadI18nParams } from './fileStore/fileValidation';
import useWhiteboardDefaults from './useWhiteboardDefaults';
import type { WhiteboardFilesManager } from './useWhiteboardFilesManager';

const FILE_IMPORT_ENABLED = true;
const SAVE_FILE_TO_DISK = true;

// Emoji insert picker constants — must match the values in @alkemio/excalidraw's EmojiPicker
const EMOJI_INSERT_FONT_SIZE = 48;
const INSERT_EMOJIS = new Set([
  '\u{1F44D}', // 👍
  '\u2B50', // ⭐
  '\u2705', // ✅
  '\u{1F4A1}', // 💡
  '\u2753', // ❓
  '\u{1F4AC}', // 💬
  '\u{1F3AF}', // 🎯
  '\u{1F44F}', // 👏
  '\u{1F4CC}', // 📌
  '\u{1F680}', // 🚀
]);

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

  const [collabApi, initializeCollab, { connecting, collaborating, mode, modeReason, isReadOnly }] = useCollab({
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
    onSceneInitChange: (initialized: boolean) => {
      setSceneInitialized(initialized);
      actions.onSceneInitChange?.(initialized);
    },
    onIncomingEmojiReaction: excalidrawApi?.dispatchIncomingEmojiReaction,
    onIncomingCountdownTimer: excalidrawApi?.dispatchIncomingCountdownTimer,
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

  // --- Emoji insert placement mode ---
  // Intercepts emoji elements that the picker places at center and lets the user click to place them instead.
  const [pendingEmoji, setPendingEmoji] = useState<string | null>(null);
  const [emojiCursorPos, setEmojiCursorPos] = useState<{ x: number; y: number } | null>(null);
  const knownElementIdsRef = useRef<Set<string>>(new Set());

  const handleEmojiPlacementClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!pendingEmoji || !excalidrawApi) return;
    import('@alkemio/excalidraw').then(({ convertToExcalidrawElements, viewportCoordsToSceneCoords }) => {
      const appState = excalidrawApi.getAppState();
      const { x, y } = viewportCoordsToSceneCoords({ clientX: e.clientX, clientY: e.clientY }, appState);
      const elements = convertToExcalidrawElements([
        { type: 'text', text: pendingEmoji, x, y, fontSize: EMOJI_INSERT_FONT_SIZE },
      ]);
      // Track the new element IDs so onChange doesn't intercept them again
      for (const el of elements) {
        knownElementIdsRef.current.add(el.id);
      }
      excalidrawApi.updateScene({
        elements: [...excalidrawApi.getSceneElements(), ...elements],
      });
      setPendingEmoji(null);
      setEmojiCursorPos(null);
    });
  };

  const handleEmojiOverlayMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    setEmojiCursorPos({ x: e.clientX, y: e.clientY });
  };

  useEffect(() => {
    if (!pendingEmoji) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPendingEmoji(null);
        setEmojiCursorPos(null);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [pendingEmoji]);

  const onChange = async (elements: readonly OrderedExcalidrawElement[], _appState: AppState, files: BinaryFiles) => {
    // Detect emoji elements freshly inserted by the picker and intercept them
    if (excalidrawApi && !pendingEmoji) {
      const knownIds = knownElementIdsRef.current;
      for (const el of elements) {
        if (
          !knownIds.has(el.id) &&
          el.type === 'text' &&
          (el as ExcalidrawTextElement).fontSize === EMOJI_INSERT_FONT_SIZE &&
          INSERT_EMOJIS.has((el as ExcalidrawTextElement).text)
        ) {
          // This is a newly inserted emoji from the picker — remove it and enter placement mode
          const filtered = elements.filter(e => e.id !== el.id);
          excalidrawApi.updateScene({ elements: filtered });
          setPendingEmoji((el as ExcalidrawTextElement).text);
          // Update known IDs with all current elements (minus the removed one)
          knownIds.clear();
          for (const e of filtered) {
            knownIds.add(e.id);
          }
          return; // Skip syncing this change
        }
      }
      // Update known IDs
      knownIds.clear();
      for (const e of elements) {
        knownIds.add(e.id);
      }
    }
    if (isReadOnly) {
      collabApi?.syncScene(elements, files);
      return;
    }
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
      {pendingEmoji && (
        <Box
          onClick={handleEmojiPlacementClick}
          onMouseMove={handleEmojiOverlayMouseMove}
          sx={{
            position: 'absolute',
            inset: 0,
            zIndex: 1000,
            cursor: 'none',
          }}
        >
          {emojiCursorPos && (
            <Box
              sx={{
                position: 'fixed',
                left: emojiCursorPos.x,
                top: emojiCursorPos.y,
                transform: 'translate(-50%, -50%)',
                fontSize: '48px',
                lineHeight: 1,
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              {pendingEmoji}
            </Box>
          )}
        </Box>
      )}
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
