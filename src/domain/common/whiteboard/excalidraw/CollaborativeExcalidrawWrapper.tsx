import React, { PropsWithChildren, Ref, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { createEmojiReactionElement } from '@/domain/collaboration/whiteboard/reactionEmoji/createEmojiReactionElement';
import { EmojiReactionPlacementInfo } from '@/domain/collaboration/whiteboard/reactionEmoji/types';
import WhiteboardEmojiReactionPicker from '@/domain/collaboration/whiteboard/components/WhiteboardEmojiReactionPicker';
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

export interface WhiteboardWhiteboardEvents {}

export interface WhiteboardWhiteboardOptions extends ExcalidrawProps {}

interface CollaborativeExcalidrawWrapperProvided extends CollabState {
  restartCollaboration: () => void;
  // Emoji reaction placement controls
  isReadOnly: boolean;
  emojiPlacementInfo: EmojiReactionPlacementInfo | null;
  onEmojiPlacementModeChange: (placementInfo: EmojiReactionPlacementInfo | null) => void;
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

  // Emoji reaction placement state
  const [emojiPlacementInfo, setEmojiPlacementInfo] = useState<EmojiReactionPlacementInfo | null>(null);

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

  // Determine if whiteboard is in read-only mode
  const isReadOnly = !collaborating || mode === 'read' || !isSceneInitialized;

  // Handle placement mode changes from emoji picker
  const handleEmojiPlacementModeChange = useCallback((placementInfo: EmojiReactionPlacementInfo | null) => {
    setEmojiPlacementInfo(placementInfo);
  }, []);

  // Ref for canvas container to detect outside clicks (T015)
  const canvasContainerRef = useRef<HTMLDivElement>(null);

  // State for emoji cursor position (tracks mouse while in placement mode)
  const [cursorPosition, setCursorPosition] = useState<{ x: number; y: number } | null>(null);

  // Track mouse position when in placement mode
  useEffect(() => {
    if (!emojiPlacementInfo?.isActive) {
      setCursorPosition(null);
      return;
    }

    const handleMouseMove = (event: MouseEvent) => {
      setCursorPosition({ x: event.clientX, y: event.clientY });
    };

    globalThis.addEventListener('mousemove', handleMouseMove);
    return () => globalThis.removeEventListener('mousemove', handleMouseMove);
  }, [emojiPlacementInfo?.isActive]);

  // Cancel placement mode when clicking outside canvas (T015)
  useEffect(() => {
    if (!emojiPlacementInfo?.isActive) {
      return;
    }

    const handleDocumentClick = (event: MouseEvent) => {
      // If click is outside the canvas container, cancel placement
      if (canvasContainerRef.current && !canvasContainerRef.current.contains(event.target as Node)) {
        setEmojiPlacementInfo(null);
      }
    };

    // Use capture phase to catch clicks before they propagate
    document.addEventListener('click', handleDocumentClick, true);
    return () => document.removeEventListener('click', handleDocumentClick, true);
  }, [emojiPlacementInfo?.isActive]);

  // Handle canvas click for emoji placement (T013)
  const handleEmojiPlacementClick = useCallback(
    async (event: React.MouseEvent<HTMLDivElement>) => {
      if (!emojiPlacementInfo?.isActive || !emojiPlacementInfo.emoji || !excalidrawApi) {
        return;
      }

      // Get the app state for coordinate conversion
      const appState = excalidrawApi.getAppState();

      // Use Excalidraw's utility function for accurate coordinate conversion
      // This correctly handles zoom, scroll, and canvas offset at all zoom levels
      const { viewportCoordsToSceneCoords } = await import('@alkemio/excalidraw');
      const sceneCoords = viewportCoordsToSceneCoords({ clientX: event.clientX, clientY: event.clientY }, appState);

      // Create emoji element
      const elementSkeleton = createEmojiReactionElement({
        emoji: emojiPlacementInfo.emoji,
        x: sceneCoords.x,
        y: sceneCoords.y,
      });

      // Dynamically import to avoid loading excalidraw in tests
      const { convertToExcalidrawElements } = await import('@alkemio/excalidraw');

      // Convert skeleton to full Excalidraw element and add to scene
      const elements = convertToExcalidrawElements([elementSkeleton]);
      const currentElements = excalidrawApi.getSceneElements();
      excalidrawApi.updateScene({
        elements: [...currentElements, ...elements],
      });

      // Clear placement mode
      setEmojiPlacementInfo(null);
    },
    [emojiPlacementInfo, excalidrawApi]
  );

  const children = (
    <Box ref={canvasContainerRef} sx={{ height: 1, flexGrow: 1, position: 'relative' }}>
      {/* Floating emoji picker button - positioned top-right below header (as per Figma design) */}
      {!isReadOnly && (
        <WhiteboardEmojiReactionPicker
          disabled={isReadOnly}
          onPlacementModeChange={handleEmojiPlacementModeChange}
          emojiPlacementInfo={emojiPlacementInfo}
          className="floating-emoji-picker"
        />
      )}
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
            detectScroll={false}
            autoFocus
            generateIdForFile={filesManager.addNewFile}
            aiEnabled={false}
            {...restOptions}
          />
        )}
      </Suspense>
      {/* Emoji placement overlay - captures clicks when in placement mode (T013, T014) */}
      {emojiPlacementInfo?.isActive && (
        <>
          <Box
            onClick={handleEmojiPlacementClick}
            sx={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              cursor: 'none', // Hide default cursor
              zIndex: 10,
              // Semi-transparent to indicate placement mode (T014)
              backgroundColor: 'rgba(0, 0, 0, 0.02)',
            }}
            aria-label={t('whiteboard.emojiReaction.placementMode', 'Click to place emoji: {{emoji}}', {
              emoji: emojiPlacementInfo.emoji,
            })}
          />
          {/* Floating emoji cursor that follows mouse position */}
          {cursorPosition && (
            <Box
              sx={{
                position: 'fixed',
                left: cursorPosition.x,
                top: cursorPosition.y,
                fontSize: '24px',
                lineHeight: 1,
                pointerEvents: 'none',
                zIndex: 11,
                transform: 'translate(-50%, -50%)',
                userSelect: 'none',
              }}
              aria-hidden="true"
            >
              {emojiPlacementInfo.emoji}
            </Box>
          )}
        </>
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
        // Emoji reaction controls
        isReadOnly,
        emojiPlacementInfo,
        onEmojiPlacementModeChange: handleEmojiPlacementModeChange,
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
