import { Excalidraw } from '@excalidraw/excalidraw';
import { ExportedDataState, ImportedDataState } from '@excalidraw/excalidraw/types/data/types';
import { ExcalidrawAPIRefValue, ExcalidrawProps } from '@excalidraw/excalidraw/types/types';
import BackupIcon from '@mui/icons-material/Backup';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { debounce } from 'lodash';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useCombinedRefs } from '../../../../hooks/useCombinedRefs';
import { Identifiable } from '../../../../domain/shared/types/Identifiable';

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
  canvas: (Identifiable & { value: string }) | undefined;
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
    const data = useMemo(() => (value ? JSON.parse(value) : initialExcalidrawState), [value]);

    const refreshOnDataChange = useCallback(
      debounce(async debouncedData => {
        const excalidraw = await combinedRef.current?.readyPromise;
        excalidraw?.updateScene(debouncedData);
      }, CANVAS_UPDATE_DEBOUNCE_INTERVAL),
      [canvas]
    );

    useEffect(() => {
      // apparently when a canvas state is changed too fast
      // it is not reflected by excalidraw (they don't have internal debounce for state change)
      refreshOnDataChange(data);
      return refreshOnDataChange.cancel;
    }, [refreshOnDataChange, data]);

    useEffect(() => {
      async function scrollToContent() {
        const excalidraw = await combinedRef.current?.readyPromise;

        excalidraw?.scrollToContent();
      }

      if (canvas?.id) {
        scrollToContent();
      }
    }, [canvas?.id]);

    const handleScroll = useRef(
      debounce(async () => {
        const excalidraw = await combinedRef.current?.readyPromise;
        if (excalidraw) {
          excalidraw.refresh();
        }
      }, WINDOW_SCROLL_HANDLER_DEBOUNCE_INTERVAL)
    ).current;

    useEffect(() => {
      window.addEventListener('scroll', handleScroll, true);

      return () => {
        handleScroll.cancel();
        window.removeEventListener('scroll', handleScroll, true);
      };
    }, []);

    // This needs to be removed in case it crashes the export window
    // We already have a Save button
    const UIOptions: ExcalidrawProps['UIOptions'] = {
      canvasActions: {
        export: {
          saveFileToDisk: false,
          renderCustomUI: (exportedElements, appState) => (
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
        },
      },
    };

    const { UIOptions: externalUIOptions, ...restOptions } = options || {};

    return (
      <div className={styles.container}>
        {canvas && (
          <Excalidraw
            key={canvas.id} // initializing a fresh Excalidraw for each canvas
            ref={combinedRef}
            initialData={data}
            UIOptions={{
              ...UIOptions,
              ...externalUIOptions,
            }}
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
