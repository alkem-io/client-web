import { useState } from 'react';
import { Box, BoxProps, Fade } from '@mui/material';
import useImageErrorHandler from './useImageErrorHandler';

export const ImageFadeIn = ({ onLoad, onError, ...props }: BoxProps<'img'>) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const reportImageError = useImageErrorHandler();

  const handleError = err => {
    reportImageError(props.src, err);
    onError?.(err);
  };

  const handleLoad = event => {
    setIsLoaded(true);
    onLoad?.(event);
  };

  return (
    <Fade in={isLoaded}>
      <Box component="img" onLoad={handleLoad} onError={handleError} {...props} />
    </Fade>
  );
};

export default ImageFadeIn;
