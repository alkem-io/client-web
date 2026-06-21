import type { ExportedDataState } from '@alkemio/excalidraw/dist/types/excalidraw/data/types';
import type { ExcalidrawImperativeAPI, ExcalidrawProps } from '@alkemio/excalidraw/dist/types/excalidraw/types';
import { type SceneJSON, WhiteboardBinding } from '@alkemio/excalidraw-yjs-binding';
import { debounce, merge } from 'lodash-es';
import { CloudUpload } from 'lucide-react';
import { Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Y from 'yjs';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { getWhiteboardImageUploadI18nParams } from './fileStore/fileValidation';
import useWhiteboardDefaults from './useWhiteboardDefaults';
import type { WhiteboardFilesManager } from './useWhiteboardFilesManager';
import { parseWhiteboardContentToScene } from './whiteboardContent';

export interface WhiteboardWhiteboardEntities {
  whiteboard: { id?: string; content: string } | undefined;
  filesManager: WhiteboardFilesManager;
}

export interface WhiteboardWhiteboardActions {
  onUpdate?: (state: ExportedDataState) => void;
  onInitApi?: (excalidrawApi: ExcalidrawImperativeAPI) => void;
  /** Hands the parent the live local Y.Doc (the single in-memory representation) for save / dirty-check. */
  onInitDoc?: (doc: Y.Doc) => void;
}

export interface WhiteboardWhiteboardOptions extends ExcalidrawProps {}

export interface WhiteboardWhiteboardProps {
  entities: WhiteboardWhiteboardEntities;
  options?: WhiteboardWhiteboardOptions;
  actions: WhiteboardWhiteboardActions;
}

const WINDOW_SCROLL_HANDLER_DEBOUNCE_INTERVAL = 100;

const Excalidraw = lazyWithGlobalErrorHandler(async () => {
  const { Excalidraw } = await import('@alkemio/excalidraw');
  await import('@alkemio/excalidraw/index.css');
  await import('./styles/excalidraw-overrides.css');
  return { default: Excalidraw };
});

/**
 * Single-user / preview / template-render whiteboard surface. The scene is
 * Y.Doc-backed end-to-end: the stored `content` JSON (a boundary representation)
 * is parsed once into a SceneJSON and seeded into a **local** `Y.Doc`; the
 * `WhiteboardBinding` (no provider / no awareness → local mode) then owns the
 * scene ↔ doc loop. There is no JSON-as-state path — `JSON.parse(content)` lands
 * straight in the doc, and the parent reads the doc back via `exportSceneJSON`
 * for save (no `serializeAsJSON`).
 */
const ExcalidrawWrapper = ({ entities, actions, options }: WhiteboardWhiteboardProps) => {
  const { whiteboard, filesManager } = entities;
  const whiteboardDefaults = useWhiteboardDefaults();
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const { t } = useTranslation();
  const notify = useNotification();

  const { addNewFile, validateFile, loadFiles, pushFilesToExcalidraw } = filesManager;

  const bindingRef = useRef<WhiteboardBinding | null>(null);

  /**
   * Validate file before adding to whiteboard.
   * Rejects invalid files with a user-visible notification.
   */
  const handleGenerateIdForFile = async (file: File): Promise<string> => {
    const validation = validateFile(file);
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
    return addNewFile(file);
  };

  // The scene parsed from the stored content boundary (memoized so the binding is
  // rebuilt only when the underlying content changes).
  const scene: SceneJSON = useMemo(() => parseWhiteboardContentToScene(whiteboard?.content), [whiteboard?.content]);

  // Build the local Y.Doc + binding once the API is available, seeding the doc
  // from the parsed scene. The binding applies the doc to the scene and captures
  // edits back into the doc; on a content/id change the effect tears down and
  // rebuilds so each whiteboard gets a fresh doc.
  useEffect(() => {
    if (!excalidrawApi) return;
    const doc = new Y.Doc();
    const binding = new WhiteboardBinding(doc, excalidrawApi, { initialScene: scene });
    bindingRef.current = binding;
    actions.onInitDoc?.(doc);

    // Preload embedded images referenced by the scene, then push them to Excalidraw.
    loadFiles(scene);
    pushFilesToExcalidraw();

    if (Array.isArray(scene.elements) && scene.elements.length > 0) {
      excalidrawApi.scrollToContent(excalidrawApi.getSceneElements(), {
        animate: false,
        fitToViewport: true,
        viewportZoomFactor: 0.75,
        maxZoom: 1,
      });
    }

    return () => {
      binding.destroy();
      bindingRef.current = null;
      doc.destroy();
    };
  }, [excalidrawApi, scene]);

  const handleScroll = useRef(
    debounce(() => {
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

  const renderCustomUI = (exportedElements, appState) => (
    <div className="Card">
      <div className="Card-icon" style={{ background: '#172d3b' }}>
        <CloudUpload />
      </div>
      <h2>{t('callout.whiteboard.export.title')}</h2>
      <div className="Card-details">{t('callout.whiteboard.export.description')}</div>
      <button
        className="ToolIcon_type_button ToolIcon_size_m Card-button ToolIcon_type_button--show ToolIcon"
        title={t('callout.whiteboard.export.save')}
        aria-label={t('callout.whiteboard.export.save')}
        type="button"
        onClick={async () => {
          if (actions.onUpdate) {
            await actions.onUpdate({
              ...(scene as unknown as ExportedDataState),
              elements: exportedElements,
              appState,
            });
            const closeButton = document.querySelector('.Modal__close') as HTMLElement;
            closeButton?.click();
          }
        }}
      >
        <div className="ToolIcon__label">{t('callout.whiteboard.export.save')}</div>
      </button>
    </div>
  );

  // This needs to be removed in case it crashes the export window
  // We already have a Save button
  const UIOptions: ExcalidrawProps['UIOptions'] = {
    canvasActions: {
      export: {
        saveFileToDisk: false,
        renderCustomUI,
      },
    },
  };

  const { UIOptions: externalUIOptions, ...restOptions } = options || {};

  const mergedUIOptions = merge(UIOptions, externalUIOptions);

  const handleInitializeApi = (api: ExcalidrawImperativeAPI) => {
    setExcalidrawApi(api);
    actions.onInitApi?.(api);
  };

  return (
    <div style={{ height: '100%', flexGrow: 1 }}>
      {whiteboard && (
        <Suspense fallback={<Loading />}>
          <Excalidraw
            key={whiteboard.id} // initializing a fresh Excalidraw for each whiteboard
            excalidrawAPI={handleInitializeApi}
            initialData={whiteboardDefaults}
            UIOptions={mergedUIOptions}
            isCollaborating={false}
            viewModeEnabled={true}
            generateIdForFile={handleGenerateIdForFile}
            aiEnabled={false}
            {...restOptions}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ExcalidrawWrapper;
