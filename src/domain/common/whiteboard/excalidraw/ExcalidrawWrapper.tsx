import type { ExportedDataState } from '@excalidraw-yjs/excalidraw/data/types';
import type {
  AssetAdapter,
  ExcalidrawImperativeAPI,
  ExcalidrawInitialDataState,
  ExcalidrawProps,
} from '@excalidraw-yjs/excalidraw/types';
import { debounce, merge } from 'lodash-es';
import { CloudUpload } from 'lucide-react';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { generateIdFromFile } from './collab/utils';
import { getWhiteboardImageUploadI18nParams, validateWhiteboardImageFile } from './fileStore/fileValidation';
import useWhiteboardDefaults from './useWhiteboardDefaults';
import { decodeWhiteboardContentUpdate } from './whiteboardContent';

export type WhiteboardWhiteboardEntities = {
  whiteboard: { id?: string; content: string } | undefined;
  /** The asset boundary for image bytes — passed straight to `<Excalidraw assetAdapter>`. */
  assetAdapter: AssetAdapter;
  /** Image upload validation limits (from the whiteboard's storage bucket). */
  imageValidation?: { allowedMimeTypes?: string[]; maxFileSize?: number };
};

export interface WhiteboardWhiteboardActions {
  onUpdate?: (state: ExportedDataState) => void;
  onInitApi?: (excalidrawApi: ExcalidrawImperativeAPI) => void;
  /**
   * Called AFTER the stored content is seeded into the scene, handing the parent
   * the API so it can begin tracking user edits — the seed itself must never count
   * as one (it is applied as a remote update and emits no local change).
   */
  onSceneInitialized?: (excalidrawApi: ExcalidrawImperativeAPI) => void;
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
 * base64-encoded Yjs-V2 snapshot) is seeded STRAIGHT into the editor's live scene
 * after mount via `applyRemoteSceneUpdate(bytes, 'v2')` — a remote apply, so the
 * seed emits no local change and never marks the whiteboard dirty. Decoding routes
 * through the shared FR-010 owner (`decodeWhiteboardContentUpdate`): unreadable
 * content (non-base64 / malformed-v2) yields an empty editable scene instead of a
 * throw. `initialData` is just the empty tool defaults (no content elements). The
 * parent gets the API via `onSceneInitialized` (fired after the seed, ALWAYS — even
 * when the content was unreadable) to track edits, and reads the scene back for save
 * via `encodeSceneStateAsUpdate('v2')` (no `serializeAsJSON`). Image bytes cross the
 * `assetAdapter`, never the doc.
 */
const ExcalidrawWrapper = ({ entities, actions, options }: WhiteboardWhiteboardProps) => {
  const { whiteboard, assetAdapter, imageValidation } = entities;
  const whiteboardDefaults = useWhiteboardDefaults();
  const [excalidrawApi, setExcalidrawApi] = useState<ExcalidrawImperativeAPI | null>(null);
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

  const content = whiteboard?.content;

  // The editor owns its scene doc (native-Yjs core) — there is no external doc and no
  // binding. Once the API is available, seed the scene from the stored content through
  // the scene port as a REMOTE 'v2' update (see the effect below), then hand the parent
  // the API to begin edit-tracking. Embedded images resolve lazily via `assetAdapter`.
  // Keyed by `whiteboard.id`, the <Excalidraw> remounts per whiteboard, so each gets a
  // fresh empty scene that this effect seeds — no teardown needed here.
  useEffect(() => {
    if (!excalidrawApi) return;
    // Seed the editor's live scene DIRECTLY from the stored content (a base64 Yjs-V2
    // snapshot) through the scene port as a REMOTE 'v2' update, so it applies without
    // emitting a local change — the seed must never count as a user edit. Embedded
    // images are resolved lazily by `assetAdapter.resolve` when the editor renders them
    // (no eager preload). Decoding goes through the shared FR-010 decode-with-fallback owner
    // (`decodeWhiteboardContentUpdate`): non-base64 / malformed-v2 content yields `null` → an
    // EMPTY editable scene, never a throw that would escape this effect (unmounting the editor
    // subtree to a blank and skipping `onSceneInitialized`). Then hand the parent the API to
    // begin edit tracking — which MUST happen even when the content was unreadable.
    const seedUpdate = decodeWhiteboardContentUpdate(content);
    if (seedUpdate) {
      excalidrawApi.applyRemoteSceneUpdate(seedUpdate, 'v2');
    }
    actions.onSceneInitialized?.(excalidrawApi);

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
  // The stored content is seeded into the editor's scene via `applyRemoteSceneUpdate`
  // in the post-mount effect above (the native-Yjs path); the element model is never
  // materialized into an `initialData` scene object.
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
            assetAdapter={assetAdapter}
            aiEnabled={false}
            {...restOptions}
          />
        </Suspense>
      )}
    </div>
  );
};

export default ExcalidrawWrapper;
