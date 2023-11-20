import React, { FC, useState } from 'react';
import { Box, BoxProps, Fade } from '@mui/material';
import useImageErrorHandler from './useImageErrorHandler';

export const ImageFadeIn: FC<BoxProps<'img'>> = ({ onLoad, onError, ...props }) => {
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
