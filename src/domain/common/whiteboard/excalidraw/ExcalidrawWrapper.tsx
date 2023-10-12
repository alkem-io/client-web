import { Excalidraw } from '@alkemio/excalidraw';
import { ExportedDataState } from '@alkemio/excalidraw/types/data/types';
import {
  BinaryFileData,
  BinaryFiles,
  ExcalidrawAPIRefValue,
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
  ExportOpts,
} from '@alkemio/excalidraw/types/types';
import BackupIcon from '@mui/icons-material/Backup';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { compact, debounce, merge } from 'lodash';
import React, { forwardRef, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useCombinedRefs } from '../../../shared/utils/useCombinedRefs';
import EmptyWhiteboard from '../EmptyWhiteboard';
import { WhiteboardFilesManager } from './useWhiteboardFilesManager';

const useActorWhiteboardStyles = makeStyles(theme => ({
  container: {
    height: '100%',
    flexGrow: 1,
  },
  '@global': {
    '.excalidraw-modal-container': {
      zIndex: `${theme.zIndex.modal + 1} !important`,
    },
  },
  excalidrawAlkemioBackground: {
    background: `${theme.palette.primary.dark} !important`,
  },
}));

export interface WhiteboardWhiteboardEntities {
  whiteboard: { id?: string; content: string } | undefined;
  filesManager: WhiteboardFilesManager;
}

export interface WhiteboardWhiteboardActions {
  onUpdate?: (state: ExportedDataState) => void;
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

const ExcalidrawWrapper = forwardRef<ExcalidrawAPIRefValue | null, WhiteboardWhiteboardProps>(
  ({ entities, actions, options }, excalidrawRef) => {
    const { whiteboard, filesManager } = entities;

    const styles = useActorWhiteboardStyles();
    const combinedRef = useCombinedRefs<ExcalidrawAPIRefValue | null>(null, excalidrawRef);

    const { addNewFile, loadFiles, importFilesToExcalidraw, fileStoreVersion } = filesManager;

    const data = useMemo(() => {
      console.log('whiteboard data changed', whiteboard?.content);
      const parsedData = whiteboard?.content ? JSON.parse(whiteboard?.content) : EmptyWhiteboard;
      loadFiles(parsedData);

      return {
        ...parsedData,
        zoomToFit: true,
      };
    }, [whiteboard?.content, combinedRef, combinedRef.current, combinedRef.current?.ready]);

    useEffect(() => {
      console.log('useEffect importing files', fileStoreVersion);
      importFilesToExcalidraw();
    }, [fileStoreVersion]);
    console.log('render ExcalidrawWrapper');

    const refreshOnDataChange = useRef(
      debounce(async (state: RefreshWhiteboardStateParam) => {
        const excalidraw = await combinedRef.current?.readyPromise;
        excalidraw?.updateScene(state);
        excalidraw?.zoomToFit();

        // Find the properties present in `state.files` and missing in currentFiles
        // and put them into missingFiles: BinaryFileData[]
        const currentFiles = excalidraw?.getFiles() ?? {};
        const newFiles = state.files ?? {};
        const missingFiles: BinaryFileData[] = compact(
          Object.keys(newFiles).map(key => (currentFiles[key] ? undefined : newFiles[key]))
        );
        if (excalidraw && missingFiles.length > 0) {
          excalidraw.addFiles(missingFiles);
          excalidraw.refresh();
        }
      }, WHITEBOARD_UPDATE_DEBOUNCE_INTERVAL)
    ).current;

    useEffect(() => {
      // apparently when a whiteboard state is changed too fast
      // it is not reflected by excalidraw (they don't have internal debounce for state change)
      refreshOnDataChange(data);
      return refreshOnDataChange.cancel;
    }, [refreshOnDataChange, data]);

    const scrollToContent = async () => {
      const excalidraw = await combinedRef.current?.readyPromise;
      excalidraw?.scrollToContent();
    };

    useEffect(() => {
      if (whiteboard?.id) {
        scrollToContent();
      }
    }, [whiteboard?.id, scrollToContent]);

    const handleScroll = useRef(
      debounce(async () => {
        const excalidraw = await combinedRef.current?.readyPromise;
        excalidraw?.refresh();
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
          <Box className={'Card'}>
            <Box className={`Card-icon ${styles.excalidrawAlkemioBackground}`}>
              <BackupIcon />
            </Box>
            <h2>Save to the Alkemio</h2>
            <Box className={'Card-details'}>Save the scene in Alkemio and share it with others.</Box>
            <button
              className={`ToolIcon_type_button ToolIcon_size_m Card-button ToolIcon_type_button--show ToolIcon ${styles.excalidrawAlkemioBackground}`}
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
      [data, actions, styles.excalidrawAlkemioBackground]
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

    return (
      <div
        className={styles.container}
        title={`storageBucketId: ${filesManager.storageBucketId} whiteboardId: ${whiteboard?.id}` /* //!! */}
      >
        {whiteboard && (
          <Excalidraw
            key={whiteboard.id} // initializing a fresh Excalidraw for each whiteboard
            ref={combinedRef}
            initialData={data}
            UIOptions={mergedUIOptions}
            isCollaborating={false}
            gridModeEnabled
            viewModeEnabled
            generateIdForFile={addNewFile}
            {...restOptions}
          />
        )}
      </div>
    );
  }
);

export default ExcalidrawWrapper;
