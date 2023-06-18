import { Excalidraw } from '@alkemio/excalidraw';
import { ExportedDataState, ImportedDataState } from '@alkemio/excalidraw/types/data/types';
import {
  AppState, BinaryFiles,
  ExcalidrawAPIRefValue,
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
  ExportOpts,
} from '@alkemio/excalidraw/types/types';
import BackupIcon from '@mui/icons-material/Backup';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { debounce, merge, unionBy } from 'lodash';
import React, { forwardRef, useCallback, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom';
import { useCombinedRefs } from '../../../../../domain/shared/utils/useCombinedRefs';
import EmptyWhiteboard from './EmptyWhiteboard';
import { HocuspocusProvider } from '@hocuspocus/provider';
import * as Y from 'yjs';
import { ExcalidrawElement } from '@alkemio/excalidraw/types/element/types';

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

    const data = useMemo(() => {
      const parsedData = canvas?.value ? JSON.parse(canvas?.value) : EmptyWhiteboard;
      return {
        ...parsedData,
        zoomToFit: true,
      };
    }, [canvas?.value]);

    const refreshOnDataChange = useRef(
      debounce(async (state: Parameters<ExcalidrawImperativeAPI['updateScene']>[0]) => {
        const excalidraw = await combinedRef.current?.readyPromise;
        excalidraw?.updateScene(state);
        excalidraw?.zoomToFit();
      }, CANVAS_UPDATE_DEBOUNCE_INTERVAL)
    ).current;

    useEffect(() => {
      // apparently when a canvas state is changed too fast
      // it is not reflected by excalidraw (they don't have internal debounce for state change)
      refreshOnDataChange(data);
      return refreshOnDataChange.cancel;
    }, [refreshOnDataChange, data]);

    const scrollToContent = async () => {
      const excalidraw = await combinedRef.current?.readyPromise;
      excalidraw?.scrollToContent();
    };

    useEffect(() => {
      if (canvas?.id) {
        scrollToContent();
      }
    }, [canvas?.id, scrollToContent]);

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

    const ydoc = new Y.Doc();
    const yjson = ydoc.getMap<ImportedDataState>('json');

    // yjson.observeDeep(() => {
    //   const updatedJson = yjson.toJSON();
    //   // Handle the updated JSON object
    //   console.log(updatedJson);
    // });

    new HocuspocusProvider({
      url: 'ws://localhost:3000/api/private/ws', // platform?....
      name: 'asd123',
      document: ydoc,
      onMessage: data => {
        Y.applyUpdate(ydoc, data.message.data);
        // console.log('onMessage received', data.event.data, data.message.data);
      },
    });

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

    const handleChange = useCallback((elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
      const oldJson = yjson.toJSON() as ImportedDataState;
      const oldElements = oldJson.elements;

      if (oldElements) {
        const mergedElements = unionBy(elements, oldElements, 'id');
        // @ts-ignore
        yjson.set('elements', mergedElements);
      }
    }, []);

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
            onChange={handleChange}
            {...restOptions}
          />
        )}
      </div>
    );
  }
);

export default CanvasWhiteboard;
