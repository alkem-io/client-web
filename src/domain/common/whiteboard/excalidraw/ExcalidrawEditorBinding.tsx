import type { AssetAdapter, ExcalidrawImperativeAPI, ExcalidrawProps } from '@excalidraw-yjs/excalidraw/types';
import { debounce, merge } from 'lodash-es';
import type React from 'react';
import { type PropsWithChildren, Suspense, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import type { Identifiable } from '@/core/utils/Identifiable';
import { generateIdFromFile } from './collab/utils';
import { getWhiteboardImageUploadI18nParams, validateWhiteboardImageFile } from './fileStore/fileValidation';
import useWhiteboardDefaults from './useWhiteboardDefaults';

const Excalidraw = lazyWithGlobalErrorHandler(async () => {
  const { Excalidraw } = await import('@excalidraw-yjs/excalidraw');
  await import('@excalidraw-yjs/excalidraw/index.css');
  await import('./styles/excalidraw-overrides.css');
  return { default: Excalidraw };
});

export type WhiteboardEditorEntities = {
  whiteboard: (Identifiable & { profile?: { url?: string } }) | undefined;
  assetAdapter: AssetAdapter;
  imageValidation?: { allowedMimeTypes?: string[]; maxFileSize?: number };
  lastSuccessfulSavedDate: Date | undefined;
};

export type WhiteboardEditorBindingProps = {
  entities: WhiteboardEditorEntities;
  options: ExcalidrawProps;
  onApi: (api: ExcalidrawImperativeAPI | null, whiteboardId: string) => void;
  loading: boolean;
  collaborating: boolean;
  readOnly: boolean;
  onPointerUpdate?: ExcalidrawProps['onPointerUpdate'];
  onEmojiReaction?: ExcalidrawProps['onRequestBroadcastEmojiReaction'];
  onCountdownTimer?: ExcalidrawProps['onRequestBroadcastCountdownTimer'];
  children?: (props: PropsWithChildren) => React.ReactNode;
};

/** Pure Excalidraw presentation/binding. It owns no transport or save policy. */
export const ExcalidrawEditorBinding = ({
  entities,
  options,
  onApi,
  loading,
  collaborating,
  readOnly,
  onPointerUpdate,
  onEmojiReaction,
  onCountdownTimer,
  children: renderChildren,
}: WhiteboardEditorBindingProps) => {
  const { whiteboard, assetAdapter, imageValidation } = entities;
  const [api, setApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const defaults = useWhiteboardDefaults();
  const { t } = useTranslation();
  const notify = useNotification();
  const refresh = useMemo(() => debounce(() => api?.refresh(), 100), [api]);
  useEffect(() => {
    window.addEventListener('scroll', refresh, true);
    return () => {
      refresh.cancel();
      window.removeEventListener('scroll', refresh, true);
    };
  }, [refresh]);

  const { UIOptions, viewModeEnabled, ...rest } = options;
  const mergedUIOptions = merge({ canvasActions: { loadScene: true, export: { saveFileToDisk: true } } }, UIOptions);
  const generateId = async (file: File): Promise<string> => {
    const result = validateWhiteboardImageFile(file, {
      allowedMimeTypes: imageValidation?.allowedMimeTypes,
      maxFileSizeBytes: imageValidation?.maxFileSize,
    });
    if (result.ok) return generateIdFromFile(file);
    const message = t(
      result.reason === 'unsupportedMimeType'
        ? 'callout.whiteboard.images.unsupportedType'
        : 'callout.whiteboard.images.tooLarge',
      getWhiteboardImageUploadI18nParams(result, t('callout.whiteboard.images.maxSizeFallback'))
    );
    notify(message, 'error');
    throw new Error(message);
  };

  const content = (
    <div className="relative h-full grow">
      <Suspense fallback={<Loading />}>
        {loading && (
          <div className="absolute inset-0 z-[1302] bg-white">
            <Loading text={t('pages.whiteboard.loadingScene')} />
          </div>
        )}
        {whiteboard && (
          <Excalidraw
            key={whiteboard.id}
            onExcalidrawAPI={next => {
              setApi(next);
              onApi(next, whiteboard.id);
            }}
            initialData={defaults}
            UIOptions={mergedUIOptions}
            isCollaborating={collaborating}
            viewModeEnabled={readOnly || viewModeEnabled}
            assetAdapter={assetAdapter}
            onPointerUpdate={onPointerUpdate}
            onRequestBroadcastEmojiReaction={onEmojiReaction}
            onRequestBroadcastCountdownTimer={onCountdownTimer}
            detectScroll={false}
            autoFocus={true}
            generateIdForFile={generateId}
            aiEnabled={false}
            {...rest}
          />
        )}
      </Suspense>
    </div>
  );
  return renderChildren ? renderChildren({ children: content }) : content;
};
