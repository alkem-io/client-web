import { Excalidraw } from '@alkemio/excalidraw';
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
import { Box, Button, Dialog, DialogActions, DialogContent } from '@mui/material';
import { makeStyles } from '@mui/styles';
import { debounce, merge } from 'lodash';
import React, { Ref, forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ReactDOM from 'react-dom';
import { useCombinedRefs } from '../../../shared/utils/useCombinedRefs';
import EmptyWhiteboard from '../EmptyWhiteboard';
import { ExcalidrawElement } from '@alkemio/excalidraw/types/element/types';
import Collab, { CollabAPI } from './collab/Collab';
import { useUserContext } from '../../../community/user';
import { WhiteboardFilesManager } from './useWhiteboardFilesManager';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { useTranslation } from 'react-i18next';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';

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
  onUpdate?: (state: ExportedDataState) => Promise<{ success: boolean; errors?: string[] }>;
  onSavedToDatabase?: () => void;
}

export interface WhiteboardWhiteboardOptions extends ExcalidrawProps {}

export interface WhiteboardWhiteboardProps {
  entities: WhiteboardWhiteboardEntities;
  options?: WhiteboardWhiteboardOptions;
  actions: WhiteboardWhiteboardActions;
  collabApiRef?: Ref<CollabAPI | null>;
}

const WINDOW_SCROLL_HANDLER_DEBOUNCE_INTERVAL = 100;

const CollaborativeExcalidrawWrapper = forwardRef<ExcalidrawAPIRefValue | null, WhiteboardWhiteboardProps>(
  ({ entities, actions, options, collabApiRef }, ref) => {
    const { t } = useTranslation();
    const { whiteboard, filesManager } = entities;

    const [collabAPI, setCollabAPI] = useState<CollabAPI | null>(null);
    const combinedCollabApiRef = useCombinedRefs<CollabAPI | null>(null, collabApiRef);

    const styles = useActorWhiteboardStyles();
    const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();
    const combinedRef = useCombinedRefs<ExcalidrawAPIRefValue | null>(null, ref);
    const [collaborationStoppedNoticeOpen, setCollaborationStoppedNoticeOpen] = useState(false);
    const [collaborationEnabled, setCollaborationEnabled] = useState(true);

    const { user } = useUserContext();
    const username = user?.user.profile.displayName ?? 'User';

    const { addNewFile, loadFiles, pushFilesToExcalidraw } = filesManager;

    const data = useMemo(() => {
      const parsedData = whiteboard?.content ? JSON.parse(whiteboard?.content) : EmptyWhiteboard;
      return {
        ...parsedData,
        zoomToFit: true,
      };
    }, [whiteboard?.content]);

    useEffect(() => {
      loadFiles(data);
    }, [data]);
    useEffect(() => {
      pushFilesToExcalidraw();
    }, [filesManager]);

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

    const UIOptions: ExcalidrawProps['UIOptions'] = useMemo(
      () => ({
        canvasActions: {
          export: {
            saveFileToDisk: true,
            renderCustomUI,
          },
        },
      }),
      [renderCustomUI]
    );

    const { UIOptions: externalUIOptions, ...restOptions } = options || {};

    const mergedUIOptions = useMemo(() => merge(UIOptions, externalUIOptions), [UIOptions, externalUIOptions]);

    const onChange = (elements: readonly ExcalidrawElement[], _appState: AppState, files: BinaryFiles) => {
      collabAPI?.syncElements(elements);
      collabAPI?.syncFiles(files);
    };

    useEffect(() => {
      if (collabAPI && whiteboard?.id) {
        collabAPI.startCollaboration({
          roomId: whiteboard.id,
        });
        setCollaborationEnabled(true);
      }
      return () => {
        setCollaborationEnabled(false);
        collabAPI?.stopCollaboration();
      };
    }, [collabAPI, whiteboard?.id]);

    const excalidrawRef = useCallback(
      async (excalidrawApiRefValue: ExcalidrawAPIRefValue) => {
        combinedRef.current = excalidrawApiRefValue;
        const excalidrawApi = await (excalidrawApiRefValue.readyPromise ?? excalidrawApiRefValue);
        setExcalidrawAPI(excalidrawApi as ExcalidrawImperativeAPI);
      },
      [combinedRef]
    );

    const collabRef = useCallback((collabApi: CollabAPI | null) => {
      combinedCollabApiRef.current = collabApi;
      setCollabAPI(collabApi);
    }, []);

    return (
      <div className={styles.container}>
        {whiteboard && (
          <Excalidraw
            key={whiteboard.id} // initializing a fresh Excalidraw for each whiteboard
            ref={excalidrawRef}
            initialData={data}
            UIOptions={mergedUIOptions}
            isCollaborating={collaborationEnabled}
            viewModeEnabled={!collaborationEnabled}
            gridModeEnabled
            onChange={onChange}
            onPointerUpdate={collabAPI?.onPointerUpdate}
            detectScroll={false}
            autoFocus
            generateIdForFile={addNewFile}
            /*renderTopRightUI={_isMobile => {
              return <LiveCollaborationStatus />;
            }}*/
            {...restOptions}
          />
        )}
        {excalidrawAPI && (
          <Collab
            username={username}
            excalidrawAPI={excalidrawAPI}
            collabAPIRef={collabRef}
            onSavedToDatabase={actions.onSavedToDatabase}
            filesManager={filesManager}
            onSaveRequest={async () => {
              const state = {
                ...(data as ExportedDataState),
                elements: excalidrawAPI.getSceneElements(),
                appState: excalidrawAPI.getAppState(),
              };
              const result = await actions.onUpdate?.(state);
              return result ?? { success: false, errors: ['Update handler not defined'] };
            }}
            onCloseConnection={() => {
              setCollaborationEnabled(false);
              setCollaborationStoppedNoticeOpen(true);
            }}
          />
        )}
        <Dialog open={collaborationStoppedNoticeOpen} onClose={() => setCollaborationStoppedNoticeOpen(false)}>
          <DialogHeader
            title={t('pages.whiteboard.whiteboardDisconnected.title')}
            onClose={() => setCollaborationStoppedNoticeOpen(false)}
          />
          <DialogContent>
            <WrapperMarkdown>{t('pages.whiteboard.whiteboardDisconnected.message')}</WrapperMarkdown>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCollaborationStoppedNoticeOpen(false)}>{t('buttons.ok')}</Button>
          </DialogActions>
        </Dialog>
      </div>
    );
  }
);

export default CollaborativeExcalidrawWrapper;
