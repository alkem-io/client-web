import Excalidraw from '@excalidraw/excalidraw';
import { ExportedDataState, ImportedDataState } from '@excalidraw/excalidraw/types/data/types';
import { ExcalidrawAPIRefValue, ExcalidrawProps } from '@excalidraw/excalidraw/types/types';
import BackupIcon from '@mui/icons-material/Backup';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { debounce } from 'lodash';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useCombinedRefs } from '../../../../hooks/useCombinedRefs';
import { Canvas } from '../../../../models/graphql-schema';
import { CanvasLoadedEvent, CANVAS_LOADED_EVENT_NAME } from '../../../../types/events';

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
  canvas: Canvas;
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

const CanvasWhiteboard = forwardRef<ExcalidrawAPIRefValue, CanvasWhiteboardProps>(
  ({ entities, actions, options }, excalidrawRef) => {
    const { canvas } = entities;

    const styles = useActorWhiteboardStyles();
    const [offsetHeight, setOffsetHeight] = useState(0);
    const innerRef = useRef<ExcalidrawAPIRefValue>(null);
    const combinedRef = useCombinedRefs<ExcalidrawAPIRefValue>(excalidrawRef, innerRef);

    const value = canvas.value;
    const data = useMemo(() => (value ? JSON.parse(value) : initialExcalidrawState), [value]);

    const refreshOnDataChange = useCallback(
      debounce(async debouncedData => {
        try {
          const excalidraw = await combinedRef.current?.readyPromise;

          excalidraw?.updateScene(debouncedData);
          excalidraw?.scrollToContent();

          // don't have another way to signal that the canvas loading has finished
          window.dispatchEvent(
            new CustomEvent<CanvasLoadedEvent>(CANVAS_LOADED_EVENT_NAME, {
              detail: {
                canvasId: canvas.id,
              },
            })
          );
        } catch (ex) {
          // Excalidraw attempts to perform state updates on an unmounted component
        }
      }, 200),
      [combinedRef.current]
    );

    useEffect(() => {
      // apparently when a canvas state is changed too fast
      // it is not reflected by excalidraw (they don't have internal debounce for state change)
      refreshOnDataChange(data);
    }, [refreshOnDataChange, data]);

    useEffect(() => {
      const onScroll = async e => {
        setOffsetHeight(e.target.offsetHeight);
        const excalidraw = await combinedRef.current?.readyPromise;
        if (excalidraw) {
          excalidraw.refresh();
        }
      };
      window.addEventListener('scroll', onScroll, true);

      return () => window.removeEventListener('scroll', onScroll);
    }, [offsetHeight]);

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
        <Excalidraw
          ref={combinedRef as any}
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
      </div>
    );
  }
);

export default CanvasWhiteboard;
