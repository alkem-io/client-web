import type { ExportedDataState } from '@alkemio/excalidraw/dist/types/excalidraw/data/types';
import type {
  BinaryFileData,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
} from '@alkemio/excalidraw/dist/types/excalidraw/types';
import BackupIcon from '@mui/icons-material/Backup';
import { Box } from '@mui/material';
import { compact, debounce, merge } from 'lodash-es';
import { Suspense, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '@/core/ui/loading/Loading';
import { useNotification } from '@/core/ui/notifications/useNotification';
import EmptyWhiteboard from '../EmptyWhiteboard';
import { getWhiteboardImageUploadI18nParams } from './fileStore/fileValidation';
import useWhiteboardDefaults from './useWhiteboardDefaults';
import type { WhiteboardFilesManager } from './useWhiteboardFilesManager';

export interface WhiteboardWhiteboardEntities {
  whiteboard: { id?: string; content: string } | undefined;
  filesManager: WhiteboardFilesManager;
}

export interface WhiteboardWhiteboardActions {
  onUpdate?: (state: ExportedDataState) => void;
  onInitApi?: (excalidrawApi: ExcalidrawImperativeAPI) => void;
}

export interface WhiteboardWhiteboardOptions extends ExcalidrawProps {}

export interface WhiteboardWhiteboardProps {
  entities: WhiteboardWhiteboardEntities;
  options?: WhiteboardWhiteboardOptions;
  actions: WhiteboardWhiteboardActions;
}

const WHITEBOARD_UPDATE_DEBOUNCE_INTERVAL = 100;
type RefreshWhiteboardStateParam = Parameters<ExcalidrawImperativeAPI['updateScene']>[0] & { files?: BinaryFiles };

const WINDOW_SCROLL_HANDLER_DEBOUNCE_INTERVAL = 100;

const Excalidraw = lazyWithGlobalErrorHandler(async () => {
  const { Excalidraw } = await import('@alkemio/excalidraw');
  await import('@alkemio/excalidraw/index.css');
  await import('./styles/excalidraw-overrides.css');
  return { default: Excalidraw };
});

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

  const data = (() => {
    const parsedData = whiteboard?.content ? JSON.parse(whiteboard?.content) : EmptyWhiteboard;

    return {
      ...parsedData,
      ...whiteboardDefaults,
    };
  })();

  useEffect(() => {
    loadFiles(data);
  }, [data]);

  useEffect(() => {
    pushFilesToExcalidraw();
  }, [filesManager]);

  const refreshOnDataChange = debounce(async (state: RefreshWhiteboardStateParam) => {
    excalidrawApi?.updateScene(state);

    if (Array.isArray(state.elements) && state.elements.length > 0) {
      excalidrawApi?.scrollToContent(state.elements, {
        animate: false,
        fitToViewport: true,
        // both values help with scaling issue when the content is displayed
        viewportZoomFactor: 0.75, // 75% of the viewport, on preview
        maxZoom: 1, // 100% zoom, in the whiteboard
      });
    }

    // Find the properties present in `state.files` and missing in currentFiles
    // and put them into missingFiles: BinaryFileData[]
    const currentFiles = excalidrawApi?.getFiles() ?? {};
    const newFiles = state.files ?? {};
    const missingFiles: BinaryFileData[] = compact(
      Object.keys(newFiles).map(key => (currentFiles[key] ? undefined : newFiles[key]))
    );
    if (excalidrawApi && missingFiles.length > 0) {
      excalidrawApi.addFiles(missingFiles);
    }
  }, WHITEBOARD_UPDATE_DEBOUNCE_INTERVAL);

  useEffect(() => {
    // apparently when a whiteboard state is changed too fast
    // it is not reflected by excalidraw (they don't have internal debounce for state change)
    refreshOnDataChange(data);
    return refreshOnDataChange.cancel;
  }, [refreshOnDataChange, data]);

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
    <Box className="Card">
      <Box className="Card-icon" sx={{ background: theme => theme.palette.primary.dark }}>
        <BackupIcon />
      </Box>
      <h2>Save to the Alkemio</h2>
      <Box className="Card-details">Save the scene in Alkemio and share it with others.</Box>
      <button
        className="ToolIcon_type_button ToolIcon_size_m Card-button ToolIcon_type_button--show ToolIcon"
        title="Save to Alkemio"
        aria-label="Save to Alkemio"
        type="button"
        onClick={async () => {
          if (actions.onUpdate) {
            await actions.onUpdate({ ...(data as ExportedDataState), elements: exportedElements, appState });
            const closeButton = document.querySelector('.Modal__close') as HTMLElement;
            closeButton?.click();
          }
        }}
      >
        <div className="ToolIcon__label">Save to Alkemio</div>
      </button>
    </Box>
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

  const handleInitializeApi = (excalidrawApi: ExcalidrawImperativeAPI) => {
    setExcalidrawApi(excalidrawApi);
    actions.onInitApi?.(excalidrawApi);
  };

  return (
    <Box sx={{ height: 1, flexGrow: 1 }}>
      {whiteboard && (
        <Suspense fallback={<Loading />}>
          <Excalidraw
            key={whiteboard.id} // initializing a fresh Excalidraw for each whiteboard
            excalidrawAPI={handleInitializeApi}
            initialData={data}
            UIOptions={mergedUIOptions}
            isCollaborating={false}
            viewModeEnabled={true}
            generateIdForFile={handleGenerateIdForFile}
            aiEnabled={false}
            {...restOptions}
          />
        </Suspense>
      )}
    </Box>
  );
};

export default ExcalidrawWrapper;
