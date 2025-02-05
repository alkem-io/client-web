import { lazyWithGlobalErrorHandler } from '@/core/lazyLoading/lazyWithGlobalErrorHandler';
import Loading from '@/core/ui/loading/Loading';
import type { ExportedDataState } from '@alkemio/excalidraw/dist/excalidraw/data/types';
import type {
  BinaryFileData,
  BinaryFiles,
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
  ExportOpts,
} from '@alkemio/excalidraw/dist/excalidraw/types';
import BackupIcon from '@mui/icons-material/Backup';
import { Box } from '@mui/material';
import { compact, debounce, merge } from 'lodash';
import { Suspense, useCallback, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import EmptyWhiteboard from '../EmptyWhiteboard';
import useWhiteboardDefaults from './useWhiteboardDefaults';
import { WhiteboardFilesManager } from './useWhiteboardFilesManager';

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
  return { default: Excalidraw };
});

const ExcalidrawWrapper = ({ entities, actions, options }: WhiteboardWhiteboardProps) => {
  const { whiteboard, filesManager } = entities;
  const whiteboardDefaults = useWhiteboardDefaults();

  const { addNewFile, loadFiles, pushFilesToExcalidraw } = filesManager;

  const data = useMemo(() => {
    const parsedData = whiteboard?.content ? JSON.parse(whiteboard?.content) : EmptyWhiteboard;

    return {
      ...parsedData,
      ...whiteboardDefaults,
    };
  }, [whiteboard?.content]);

  useEffect(() => {
    loadFiles(data);
  }, [data]);

  useEffect(() => {
    pushFilesToExcalidraw();
  }, [filesManager]);

  const refreshOnDataChange = useRef(
    debounce(async (state: RefreshWhiteboardStateParam) => {
      excalidrawApiRef.current?.updateScene(state);
      excalidrawApiRef.current?.zoomToFit();

      // Find the properties present in `state.files` and missing in currentFiles
      // and put them into missingFiles: BinaryFileData[]
      const currentFiles = excalidrawApiRef.current?.getFiles() ?? {};
      const newFiles = state.files ?? {};
      const missingFiles: BinaryFileData[] = compact(
        Object.keys(newFiles).map(key => (currentFiles[key] ? undefined : newFiles[key]))
      );
      if (excalidrawApiRef.current && missingFiles.length > 0) {
        excalidrawApiRef.current.addFiles(missingFiles);
      }
    }, WHITEBOARD_UPDATE_DEBOUNCE_INTERVAL)
  ).current;

  useEffect(() => {
    // apparently when a whiteboard state is changed too fast
    // it is not reflected by excalidraw (they don't have internal debounce for state change)
    refreshOnDataChange(data);
    return refreshOnDataChange.cancel;
  }, [refreshOnDataChange, data]);

  const handleScroll = useRef(
    debounce(() => {
      excalidrawApiRef.current?.refresh();
    }, WINDOW_SCROLL_HANDLER_DEBOUNCE_INTERVAL)
  ).current;

  useEffect(() => {
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      handleScroll.cancel();
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [handleScroll]);

  const renderCustomUI = useMemo<ExportOpts['renderCustomUI']>(
    () => (exportedElements, appState) =>
      (
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
                const element = document.body.getElementsByClassName('Modal__close')[0];
                ReactDOM.findDOMNode(element)?.dispatchEvent(
                  new MouseEvent('click', { view: window, cancelable: true, bubbles: true })
                );
              }
            }}
          >
            <div className="ToolIcon__label">Save to Alkemio</div>
          </button>
        </Box>
      ),
    [data, actions]
  );

  // This needs to be removed in case it crashes the export window
  // We already have a Save button
  const UIOptions: ExcalidrawProps['UIOptions'] = useMemo(
    () => ({
      canvasActions: {
        export: {
          saveFileToDisk: false,
          renderCustomUI,
        },
      },
    }),
    [renderCustomUI]
  );

  const { UIOptions: externalUIOptions, ...restOptions } = options || {};

  const mergedUIOptions = useMemo(() => merge(UIOptions, externalUIOptions), [UIOptions, externalUIOptions]);

  const excalidrawApiRef = useRef<ExcalidrawImperativeAPI | null>(null);

  const handleInitializeApi = useCallback(
    (excalidrawApi: ExcalidrawImperativeAPI) => {
      excalidrawApiRef.current = excalidrawApi;
      actions.onInitApi?.(excalidrawApi);
    },
    [actions.onInitApi]
  );

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
            viewModeEnabled
            generateIdForFile={addNewFile}
            aiEnabled={false}
            {...restOptions}
          />
        </Suspense>
      )}
    </Box>
  );
};

export default ExcalidrawWrapper;
