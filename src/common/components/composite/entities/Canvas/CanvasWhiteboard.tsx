import { Excalidraw } from '@alkemio/excalidraw';
import { ExportedDataState, ImportedDataState } from '@alkemio/excalidraw/types/data/types';
import { ExcalidrawAPIRefValue, ExcalidrawProps, ExportOpts } from '@alkemio/excalidraw/types/types';
import BackupIcon from '@mui/icons-material/Backup';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { debounce, merge } from 'lodash';
import React, { forwardRef, useEffect, useMemo } from 'react';
import ReactDOM from 'react-dom';
import { useCombinedRefs } from '../../../../../domain/shared/utils/useCombinedRefs';
import useAsyncInterruptibleCallback from '../../../../../domain/shared/utils/useAsyncInterruptibleCallback';

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

const initialExcalidrawState: ImportedDataState = {
  type: 'excalidraw',
  version: 2,
  source: 'https://excalidraw.com',
  elements: [],
  appState: {
    gridSize: null,
    viewBackgroundColor: '#ffffff',
  },
};

export interface CanvasWhiteboardEntities {
  canvas: { id?: string; value: string } | undefined;
}

export interface CanvasWhiteboardActions {
  onUpdate?: (state: ExportedDataState) => void;
}

export interface CanvasWhiteboardOptions extends ExcalidrawProps {}

export interface CanvasWhiteboardProps {
  entities: CanvasWhiteboardEntities;
  options?: CanvasWhiteboardOptions;
  actions: CanvasWhiteboardActions;
}

const CANVAS_UPDATE_DEBOUNCE_INTERVAL = 100;
const WINDOW_SCROLL_HANDLER_DEBOUNCE_INTERVAL = 100;

const CanvasWhiteboard = forwardRef<ExcalidrawAPIRefValue | null, CanvasWhiteboardProps>(
  ({ entities, actions, options }, excalidrawRef) => {
    const { canvas } = entities;

    const styles = useActorWhiteboardStyles();
    const combinedRef = useCombinedRefs<ExcalidrawAPIRefValue | null>(null, excalidrawRef);

    const value = canvas?.value;
    const data = useMemo(() => {
      const parsedData = value ? JSON.parse(value) : initialExcalidrawState;
      parsedData.zoomToFit = true;
      return parsedData;
    }, [value]);

    const refreshOnDataChange = useAsyncInterruptibleCallback(check =>
      debounce(async debouncedData => {
        const excalidraw = await check(combinedRef.current?.readyPromise);
        excalidraw?.updateScene(debouncedData);
        excalidraw?.zoomToFit();
      }, CANVAS_UPDATE_DEBOUNCE_INTERVAL)
    );

    useEffect(() => {
      // apparently when a canvas state is changed too fast
      // it is not reflected by excalidraw (they don't have internal debounce for state change)
      refreshOnDataChange(data);
      return refreshOnDataChange.cancel;
    }, [refreshOnDataChange, data]);

    const scrollToContent = useAsyncInterruptibleCallback(check => async () => {
      const excalidraw = await check(combinedRef.current?.readyPromise);
      excalidraw?.scrollToContent();
    });

    useEffect(() => {
      if (canvas?.id) {
        scrollToContent();
      }
    }, [canvas?.id, scrollToContent]);

    const handleScroll = useAsyncInterruptibleCallback(check =>
      debounce(async () => {
        const excalidraw = await check(combinedRef.current?.readyPromise);
        excalidraw?.refresh();
      }, WINDOW_SCROLL_HANDLER_DEBOUNCE_INTERVAL)
    );

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
      <div className={styles.container}>
        {canvas && (
          <Excalidraw
            key={canvas.id} // initializing a fresh Excalidraw for each canvas
            ref={combinedRef}
            initialData={data}
            UIOptions={mergedUIOptions}
            isCollaborating={false}
            gridModeEnabled
            viewModeEnabled
            {...restOptions}
          />
        )}
      </div>
    );
  }
);

export default CanvasWhiteboard;
