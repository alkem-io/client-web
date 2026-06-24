import type { ExportedDataState } from '@excalidraw-yjs/excalidraw/dist/types/excalidraw/data/types';
import type {
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  ExcalidrawProps,
} from '@excalidraw-yjs/excalidraw/dist/types/excalidraw/types';
import { fromBase64 } from 'lib0/buffer';
import { debounce, merge } from 'lodash-es';
import { CloudUpload } from 'lucide-react';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as Y from 'yjs';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { SEED_ORIGIN } from './collab/seedOrigin';
import { getWhiteboardImageUploadI18nParams } from './fileStore/fileValidation';
import type { BinaryFileDataWithOptionalUrl } from './types';
import useWhiteboardDefaults from './useWhiteboardDefaults';
import type { WhiteboardFilesManager } from './useWhiteboardFilesManager';

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

// `.excalidraw` export-file envelope constants (the export is a JSON FILE format by
// design — distinct from the Yjs `content` boundary). The export's `elements`/`appState`
// come from the editor's own render-time args and its files from the live doc; only this
// envelope is constant.
const EXPORT_TYPE = 'excalidraw';
const EXPORT_VERSION = 2;
const EXPORT_SOURCE = 'https://excalidraw.com';

const Excalidraw = lazyWithGlobalErrorHandler(async () => {
  const { Excalidraw } = await import('@excalidraw-yjs/excalidraw');
  await import('@excalidraw-yjs/excalidraw/index.css');
  await import('./styles/excalidraw-overrides.css');
  return { default: Excalidraw };
});

/**
 * Single-user / preview / template-render whiteboard surface. The scene is
 * Y.Doc-backed end-to-end via the native-Yjs core: the editor's `Scene` IS the
 * `Y.Doc`, so there is no external doc and no binding — and the element model is
 * never materialized into a scene object on this path. The stored `content` (a
 * base64-encoded Yjs-V2 snapshot) is applied STRAIGHT into the editor's live
 * `Scene.doc` via `Y.applyUpdateV2` after mount — the same native seed the
 * collaborative provider performs — so the doc is the sole representation.
 * `initialData` is just the empty tool defaults (no content elements). The parent
 * receives the editor's live doc via `getSceneDoc()` (handed up by `onInitDoc`)
 * and reads it back by encoding its V2 state for save (no `serializeAsJSON`,
 * no `decodeSnapshot`).
 */
const ExcalidrawWrapper = ({ entities, actions, options }: WhiteboardWhiteboardProps) => {
  const { whiteboard, filesManager } = entities;
  const whiteboardDefaults = useWhiteboardDefaults();
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);
  const { t } = useTranslation();
  const notify = useNotification();

  const { addNewFile, validateFile, loadFiles, pushFilesToExcalidraw } = filesManager;

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

  const content = whiteboard?.content;

  // The editor's `Scene` IS the `Y.Doc` (native-Yjs core) — there is no external doc,
  // no binding, and the element model is never materialized into a scene object here.
  // Once the API is available, seed the editor's live doc DIRECTLY from the stored
  // content (a base64-encoded Yjs-V2 snapshot) via `Y.applyUpdateV2` — the same native
  // seed the collaborative provider performs — tagging it with `SEED_ORIGIN` so the
  // parent's doc-update dirty-check ignores the seed. Then hand the parent that live
  // doc (for save / dirty-check), preload the embedded image blobs the seeded elements
  // reference (read off the doc via `getFiles()` AFTER the apply), and scroll to fit.
  // Keyed by `whiteboard.id`, the <Excalidraw> remounts per whiteboard, so each gets a
  // fresh empty doc that this effect seeds — no teardown needed here.
  useEffect(() => {
    if (!excalidrawApi) return;
    const doc = excalidrawApi.getSceneDoc();
    if (content?.trim()) {
      Y.applyUpdateV2(doc, fromBase64(content), SEED_ORIGIN);
    }
    actions.onInitDoc?.(doc);

    // Preload the embedded image blobs the seeded elements reference. After the apply,
    // the doc's file records live in the editor's file store; load them through the
    // files manager (download remote-only ones, cache dataURL ones) and push back.
    // The file records are full `BinaryFileData` at runtime; the element package types
    // them loosely, so coerce at the boundary to the files-manager's expected shape.
    loadFiles({ files: excalidrawApi.getFiles() as unknown as Record<string, BinaryFileDataWithOptionalUrl> });
    pushFilesToExcalidraw();

    const elements = excalidrawApi.getSceneElements();
    if (elements.length > 0) {
      excalidrawApi.scrollToContent(elements, {
        animate: false,
        fitToViewport: true,
        viewportZoomFactor: 0.75,
        maxZoom: 1,
      });
    }
  }, [excalidrawApi, content]);

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
          if (actions.onUpdate && excalidrawApi) {
            // Build the `.excalidraw` export-file state from the editor's own export
            // args (elements + appState) plus its live doc-backed files — never from a
            // materialized scene object.
            await actions.onUpdate({
              type: EXPORT_TYPE,
              version: EXPORT_VERSION,
              source: EXPORT_SOURCE,
              elements: exportedElements,
              appState,
              files: excalidrawApi.getFiles(),
            } as ExportedDataState);
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

  const handleInitializeApi = (api: ExcalidrawImperativeAPI | null) => {
    if (!api) return;
    setExcalidrawApi(api);
    actions.onInitApi?.(api);
  };

  // `initialData` is just the empty tool defaults — NO content elements/files/appState.
  // The stored content is seeded straight into the editor's live `Scene.doc` via
  // `Y.applyUpdateV2` in the post-mount effect above (the native-Yjs path); the element
  // model is never materialized into an `initialData` scene object.
  const initialData = whiteboardDefaults as unknown as ExcalidrawInitialDataState;

  return (
    <div style={{ height: '100%', flexGrow: 1 }}>
      {whiteboard && (
        <Suspense fallback={<Loading />}>
          <Excalidraw
            key={whiteboard.id} // initializing a fresh Excalidraw for each whiteboard
            onExcalidrawAPI={handleInitializeApi}
            initialData={initialData}
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
