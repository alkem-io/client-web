import { Excalidraw, newElementWith } from '@alkemio/excalidraw';
import { ExportedDataState } from '@alkemio/excalidraw/types/data/types';
import {
  AppState,
  BinaryFiles,
  ExcalidrawAPIRefValue,
  ExcalidrawImperativeAPI,
  ExcalidrawProps,
  ExportOpts,
} from '@alkemio/excalidraw/types/types';
import BackupIcon from '@mui/icons-material/Backup';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { debounce, merge } from 'lodash';
import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useCombinedRefs } from '../../../shared/utils/useCombinedRefs';
import EmptyWhiteboard from '../EmptyWhiteboard';
import { LocalData } from './collab/data/LocalData';
import { ExcalidrawElement } from '@alkemio/excalidraw/types/element/types';
import Collab, { CollabAPI, collabAPIAtom } from './collab/Collab';
import { useAtom } from 'jotai';
import { useCallbackRefState } from './useCallbackRefState';
import LiveCollaborationStatus from './collab/LiveCollaborationStatus';
import { useUserContext } from '../../../community/user';

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
  whiteboard: { id?: string; value: string } | undefined;
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
const WINDOW_SCROLL_HANDLER_DEBOUNCE_INTERVAL = 100;

const CollaborativeExcalidrawWrapper = forwardRef<ExcalidrawAPIRefValue | null, WhiteboardWhiteboardProps>(
  ({ entities, actions, options }, excalidrawRef) => {
    const { whiteboard } = entities;

    const [collabAPI, setCollabAPIRef] = useState<CollabAPI>();

    console.log('collabAPI', collabAPI);

    const styles = useActorWhiteboardStyles();
    const combinedRef = useCombinedRefs<ExcalidrawAPIRefValue | null>(null, excalidrawRef);
    const [excalidrawAPI, excalidrawRefCallback] = useCallbackRefState<ExcalidrawImperativeAPI>();

    const { user } = useUserContext();
    const username = user?.user.profile.displayName ?? 'User'; //!!

    const data = useMemo(() => {
      const parsedData = whiteboard?.value ? JSON.parse(whiteboard?.value) : EmptyWhiteboard;
      return {
        ...parsedData,
        zoomToFit: true,
      };
    }, [whiteboard?.value]);

    const refreshOnDataChange = useRef(
      debounce(async (state: Parameters<ExcalidrawImperativeAPI['updateScene']>[0]) => {
        const excalidraw = await combinedRef.current?.readyPromise;
        excalidraw?.updateScene(state);
        excalidraw?.zoomToFit();
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

    const onChange = (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
      console.log('onChange');
      collabAPI?.syncElements(elements);

      // this check is redundant, but since this is a hot path, it's best
      // not to evaludate the nested expression every time
      if (!LocalData.isSavePaused()) {
        LocalData.save(elements, appState, files, () => {
          if (excalidrawAPI) {
            let didChange = false;

            const elements = excalidrawAPI.getSceneElementsIncludingDeleted().map(element => {
              if (LocalData.fileStorage.shouldUpdateImageElementStatus(element)) {
                const newElement = newElementWith(element, { status: 'saved' });
                if (newElement !== element) {
                  didChange = true;
                }
                return newElement;
              }
              return element;
            });

            if (didChange) {
              excalidrawAPI.updateScene({
                elements,
              });
            }
          }
        });
      }
    };

    useEffect(() => {
      console.log({ collabAPI, whiteboardId: whiteboard?.id });
      if (collabAPI && whiteboard?.id) {
        console.log(`starting collaboration on room:${whiteboard.id}`);
        collabAPI.startCollaboration({
          roomId: whiteboard.id,
          roomKey: 'ghggh',
        });
      }
    }, [collabAPI]);

    return (
      <div className={styles.container} style={{ border: '1px solid red' }}>
        {whiteboard && (
          <Excalidraw
            key={whiteboard.id} // initializing a fresh Excalidraw for each whiteboard
            ref={excalidrawRefCallback}
            initialData={data}
            UIOptions={mergedUIOptions}
            isCollaborating
            gridModeEnabled
            viewModeEnabled
            onChange={onChange}
            onPointerUpdate={collabAPI?.onPointerUpdate}
            detectScroll={false}
            autoFocus
            renderTopRightUI={isMobile => {
              return <LiveCollaborationStatus />;
            }}
            {...restOptions}
          />
        )}
        {excalidrawAPI && <Collab username={username} excalidrawAPI={excalidrawAPI} collabAPIRef={setCollabAPIRef} />}
      </div>
    );
  }
);

export default CollaborativeExcalidrawWrapper;
