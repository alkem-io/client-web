import { useEffect, ReactNode } from 'react';
import ReactDOM from 'react-dom';
import usePreview from './usePreview';
import usePortal from './usePortal';

import { useFullscreenPreview } from '../../context/FullscreenPreviewContext';
import { Box, IconButton } from '@mui/material';

import close from '../../assets/close.svg';
import plus from '../../assets/plus.svg';
import minus from '../../assets/minus.svg';
import zoomIn from '../../assets/zoom-in.svg';
import zoomOut from '../../assets/zoom-out.svg';

type Props = {
  zoomStep?: number;
};

export default function FullScreenPreview({ zoomStep }: Props) {
  const { state, initFileSize, onZoomIn, onZoomOut, onResizePageZoom } = usePreview(zoomStep);

  const { state: previewState, closePreview } = useFullscreenPreview();
  const { src, alt, width, height, visible } = previewState;

  useEffect(() => {
    if (src) {
      initFileSize(width, height);
    }
  }, [src]);

  const pDom = usePortal();

  const onClosePreview = () => {
    closePreview();
  };

  const childNode: ReactNode = (
    <Box
      sx={{
        width: '100vw',
        height: '100vh',
        bgcolor: 'rgba(0,0,0,0.75)',
        overflow: 'hidden',
        position: 'fixed',
        zIndex: 9999,
        left: 0,
        top: 0,
      }}
    >
      <Box
        sx={{
          width: '100%',
          height: '100%',
          overflow: 'scroll',
          position: 'relative',
        }}
      >
        <Box
          component="img"
          {...state.layout}
          src={src}
          alt={alt}
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            margin: 'auto',
            transition: 'all 0.3s ease',
            maxWidth: '100%',
            maxHeight: '100%',
          }}
        />
      </Box>
      <IconButton
        onClick={onClosePreview}
        sx={{
          position: 'absolute',
          right: 0,
          top: 0,
          p: 0,
          width: 32,
          height: 32,
          m: 2,
          bgcolor: 'common.white',
          boxShadow: '0 3px 8px 0px rgba(0,0,0,0.3)',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          '&:hover': { bgcolor: 'grey.100' },
        }}
      >
        <Box
          component="img"
          src={close}
          sx={{
            width: 20,
            height: 20,
          }}
        />
      </IconButton>
      <Box
        sx={{
          position: 'fixed',
          right: 16,
          bottom: 16,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <IconButton onClick={onResizePageZoom} sx={toolbarButtonSx}>
          <Box component="img" src={state.zoom ? zoomOut : zoomIn} alt="reset zoom" sx={iconSx} />
        </IconButton>
        <IconButton onClick={onZoomIn} sx={toolbarButtonSx}>
          <Box component="img" src={plus} alt="zoom in" sx={iconSx} />
        </IconButton>
        <IconButton onClick={onZoomOut} sx={toolbarButtonSx}>
          <Box component="img" src={minus} alt="zoom out" sx={iconSx} />
        </IconButton>
      </Box>
    </Box>
  );

  return visible ? ReactDOM.createPortal(childNode, pDom) : null;
}

const toolbarButtonSx = {
  p: 0,
  m: 2,
  boxShadow: '0 3px 8px 0px rgba(0,0,0,0.3)',
  borderRadius: '50%',
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  outline: 'none',
  bgcolor: 'common.white',
  border: 'none',
  '&:hover': { bgcolor: 'grey.100' },
};

const iconSx = { width: 20, height: 20 };
