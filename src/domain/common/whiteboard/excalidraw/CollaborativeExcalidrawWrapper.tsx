import type { AssetAdapter, ExcalidrawImperativeAPI, ExcalidrawProps } from '@excalidraw-yjs/excalidraw/types';
import { debounce, merge } from 'lodash-es';
import type React from 'react';
import { type PropsWithChildren, type Ref, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { Identifiable } from '@/core/utils/Identifiable';
import { resolveWhiteboardGuestIdentity } from '@/domain/collaboration/whiteboard/guestAccess/utils/resolveWhiteboardGuestIdentity';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';
import useCollab, { type CollabAPI, type CollabState } from './collab/useCollab';
import { generateIdFromFile } from './collab/utils';
import { getWhiteboardImageUploadI18nParams, validateWhiteboardImageFile } from './fileStore/fileValidation';
import useWhiteboardDefaults from './useWhiteboardDefaults';

const FILE_IMPORT_ENABLED = true;
const SAVE_FILE_TO_DISK = true;
const WINDOW_SCROLL_HANDLER_DEBOUNCE_INTERVAL = 100;

const Excalidraw = lazyWithGlobalErrorHandler(async () => {
  const { Excalidraw } = await import('@excalidraw-yjs/excalidraw');
  await import('@excalidraw-yjs/excalidraw/index.css');
  await import('./styles/excalidraw-overrides.css');
  return { default: Excalidraw };
});

const LoadingScene = ({ enabled }: { enabled: boolean }) => {
  const { t } = useTranslation();
  return enabled ? (
    <div className="absolute size-full z-[1302] bg-white">
      <Loading text={t('pages.whiteboard.loadingScene')} />
    </div>
  ) : null;
};

export type WhiteboardWhiteboardEntities = {
  whiteboard: (Identifiable & { profile?: { url?: string } }) | undefined;
  assetAdapter: AssetAdapter;
  imageValidation?: { allowedMimeTypes?: string[]; maxFileSize?: number };
  lastSuccessfulSavedDate: Date | undefined;
};

export interface WhiteboardWhiteboardActions {
  onInitApi?: (excalidrawApi: ExcalidrawImperativeAPI) => void;
  onSceneInitChange?: (initialized: boolean) => void;
  onRemoteSave?: (error?: string) => void;
}

export interface WhiteboardWhiteboardOptions extends ExcalidrawProps {}

interface CollaborativeExcalidrawWrapperProvided extends CollabState {
  resumeCollaboration: () => void;
}

export interface WhiteboardWhiteboardProps {
  entities: WhiteboardWhiteboardEntities;
  options: WhiteboardWhiteboardOptions;
  actions: WhiteboardWhiteboardActions;
  collabApiRef?: Ref<CollabAPI | null>;
  children: (props: PropsWithChildren<CollaborativeExcalidrawWrapperProvided>) => React.ReactNode;
}

const CollaborativeExcalidrawWrapper = ({
  entities,
  actions,
  options,
  collabApiRef,
  children: renderChildren,
}: WhiteboardWhiteboardProps) => {
  const { whiteboard, assetAdapter, imageValidation } = entities;
  const [excalidrawApi, setExcalidrawApi] = useState<{
    api: ExcalidrawImperativeAPI;
    whiteboardId: string;
  } | null>(null);
  const whiteboardDefaults = useWhiteboardDefaults();
  const { t } = useTranslation();
  const notify = useNotification();
  const combinedCollabApiRef = useCombinedRefs<CollabAPI | null>(null, collabApiRef);
  const { userModel } = useCurrentUserContext();

  const username = (() => {
    const { isPublicRoute, guestName } = resolveWhiteboardGuestIdentity();
    return isPublicRoute
      ? (guestName ?? t('common.guestUserFallback'))
      : (userModel?.profile?.displayName ?? t('common.guestUserFallback'));
  })();

  const handleGenerateIdForFile = async (file: File): Promise<string> => {
    const validation = validateWhiteboardImageFile(file, {
      allowedMimeTypes: imageValidation?.allowedMimeTypes,
      maxFileSizeBytes: imageValidation?.maxFileSize,
    });
    if (!validation.ok) {
      const params = getWhiteboardImageUploadI18nParams(validation, t('callout.whiteboard.images.maxSizeFallback'));
      const message =
        validation.reason === 'unsupportedMimeType'
          ? t('callout.whiteboard.images.unsupportedType', params)
          : t('callout.whiteboard.images.tooLarge', params);
      notify(message, 'error');
      throw new Error(message);
    }
    return generateIdFromFile(file);
  };

  const debouncedRefresh = useMemo(
    () => debounce(() => excalidrawApi?.api.refresh(), WINDOW_SCROLL_HANDLER_DEBOUNCE_INTERVAL),
    [excalidrawApi]
  );

  useEffect(() => {
    window.addEventListener('scroll', debouncedRefresh, true);
    return () => {
      debouncedRefresh.cancel();
      window.removeEventListener('scroll', debouncedRefresh, true);
    };
  }, [debouncedRefresh]);

  const defaultUIOptions: ExcalidrawProps['UIOptions'] = {
    canvasActions: {
      loadScene: FILE_IMPORT_ENABLED,
      export: { saveFileToDisk: SAVE_FILE_TO_DISK },
    },
  };
  const { UIOptions: externalUIOptions, viewModeEnabled: externallyReadOnly, ...restOptions } = options;
  const mergedUIOptions = merge(defaultUIOptions, externalUIOptions);

  const [collabApi, initializeCollab, collabState] = useCollab({
    username,
    onRemoteSave: actions.onRemoteSave,
    onSceneInitChange: actions.onSceneInitChange,
  });

  useEffect(() => {
    // eslint-disable-next-line react-compiler/react-compiler -- useCombinedRefs returns a mutable ref
    combinedCollabApiRef.current = collabApi;
  }, [collabApi]);

  useEffect(() => {
    if (!excalidrawApi || !whiteboard?.id || excalidrawApi.whiteboardId !== whiteboard.id) return;
    return initializeCollab({ excalidrawApi: excalidrawApi.api, roomId: whiteboard.id });
  }, [excalidrawApi, whiteboard?.id]);

  const handleInitializeApi = (api: ExcalidrawImperativeAPI | null) => {
    if (!api || !whiteboard?.id) return;
    setExcalidrawApi({ api, whiteboardId: whiteboard.id });
    actions.onInitApi?.(api);
  };

  const children = (
    <div className="h-full grow relative">
      <Suspense fallback={<Loading />}>
        <LoadingScene enabled={collabState.state.status === 'connecting'} />
        {whiteboard && (
          <Excalidraw
            key={whiteboard.id}
            onExcalidrawAPI={handleInitializeApi}
            initialData={whiteboardDefaults}
            UIOptions={mergedUIOptions}
            isCollaborating={collabState.collaborating}
            viewModeEnabled={collabState.isReadOnly || externallyReadOnly}
            assetAdapter={assetAdapter}
            onPointerUpdate={collabApi?.onPointerUpdate}
            onRequestBroadcastEmojiReaction={(emoji, x, y) => collabApi?.broadcastEmojiReaction(emoji, x, y)}
            onRequestBroadcastCountdownTimer={(seconds, startedBy, active) =>
              collabApi?.broadcastCountdownTimer(seconds, startedBy, active)
            }
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

  return renderChildren({
    children,
    ...collabState,
    resumeCollaboration: () => collabApi?.resume(),
  });
};

export default CollaborativeExcalidrawWrapper;
