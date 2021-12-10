import Excalidraw from '@excalidraw/excalidraw';
import { ImportedDataState } from '@excalidraw/excalidraw/types/data/types';
import { ExcalidrawAPIRefValue, ExcalidrawProps } from '@excalidraw/excalidraw/types/types';
import BackupIcon from '@mui/icons-material/Backup';
import { Box } from '@mui/material';
import { makeStyles } from '@mui/styles';
import React, { FC, useEffect, useRef, useState } from 'react';
import { Canvas } from '../../../../models/graphql-schema';

const useActorWhiteboardStyles = makeStyles(theme => ({
  container: {
    height: '100%',
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

const initialExcalidrawState = {
  type: 'excalidraw',
  version: 2,
  source: 'https://excalidraw.com',
  elements: [],
  appState: {
    gridSize: null,
    viewBackgroundColor: '#ffffff',
  },
  files: {},
};

export interface CanvasWhiteboardEntities {
  canvas: Canvas;
}

export interface CanvasWhiteboardActions {
  onUpdate: (state: ImportedDataState) => void;
}

export interface CanvasWhiteboardOptions extends ExcalidrawProps {}

export interface CanvasWhiteboardProps {
  entities: CanvasWhiteboardEntities;
  options?: CanvasWhiteboardOptions;
  actions: CanvasWhiteboardActions;
}

const CanvasWhiteboard: FC<CanvasWhiteboardProps> = ({ entities, actions, options }) => {
  const { canvas } = entities;

  const excalidrawRef = useRef<ExcalidrawAPIRefValue>(null);
  const styles = useActorWhiteboardStyles();
  const [offsetHeight, setOffsetHeight] = useState(0);

  const [data, setData] = useState(canvas?.value ? JSON.parse(canvas?.value) : initialExcalidrawState);

  useEffect(() => {
    setData(canvas?.value ? JSON.parse(canvas?.value) : initialExcalidrawState);
  }, [canvas.value]);

  useEffect(() => {}, [data, actions.onUpdate]);

  useEffect(() => {
    const onScroll = async e => {
      setOffsetHeight(e.target.offsetHeight);
      const excalidraw = await excalidrawRef.current?.readyPromise;
      if (excalidraw) {
        excalidraw.refresh();
      }
    };
    window.addEventListener('scroll', onScroll, true);
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
            <h2>Save to the Alkemio cloud</h2>
            <Box className={'Card-details'}>Save the scene in the Alkemio cloud and share it with others.</Box>
            <button
              className={`ToolIcon_type_button ToolIcon_size_m Card-button ToolIcon_type_button--show ToolIcon ${styles.excalidrawAlkemioBackground}`}
              title="Save to cloud"
              aria-label="Save to cloud"
              type="button"
              onClick={() => actions.onUpdate({ ...data, elements: exportedElements, appState })}
            >
              <div className="ToolIcon__label">Save to Alkemio</div>
            </button>
          </Box>
        ),
      },
    },
  };

  return (
    <div className={styles.container}>
      {/* <Button variant="primary" onClick={showNewActorModalF} text="New Actor"></Button> */}
      <Excalidraw
        ref={excalidrawRef}
        initialData={data}
        UIOptions={UIOptions}
        gridModeEnabled
        viewModeEnabled
        {...options}
      />
    </div>
  );
};

export default CanvasWhiteboard;
