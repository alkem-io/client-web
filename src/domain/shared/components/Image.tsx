import React, { FC, useState } from 'react';
import { Box, BoxProps, Fade } from '@mui/material';

export const Image: FC<BoxProps<'img'>> = props => {
  const [isLoaded, setIsLoaded] = useState(false);

  return (
    <Fade in={isLoaded}>
      <Box component="img" onLoad={() => setIsLoaded(true)} onError={() => setIsLoaded(true)} {...props} />
    </Fade>
  );
};

export default Image;
