import React, { ReactNode } from 'react';
import { Box, BoxProps } from '@mui/material';

export const CARD_IMAGE_ASPECT_RATIO_DEFAULT = '16/10';

interface CardImageProps extends BoxProps<'img'> {
  aspectRatio?: string;
  defaultImage?: ReactNode;
}

const CardImage = ({ aspectRatio = CARD_IMAGE_ASPECT_RATIO_DEFAULT, defaultImage, ...props }: CardImageProps) => {
  if (defaultImage && !props.src) {
    return (
      <Box display="block" width="100%" sx={{ aspectRatio }} {...props}>
        {defaultImage}
      </Box>
    );
  } else {
    return <Box component="img" display="block" width="100%" sx={{ aspectRatio, objectFit: 'cover' }} {...props} />;
  }
};

export default CardImage;
