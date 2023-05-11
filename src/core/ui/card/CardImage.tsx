import React, { ReactNode } from 'react';
import { Box, BoxProps } from '@mui/material';
import { ImageWrapper } from '../../../domain/shared/components/ImageWrapper';

export const CARD_IMAGE_ASPECT_RATIO_DEFAULT = '16/10';

interface CardImageProps extends BoxProps<'img'> {
  aspectRatio?: string;
  defaultImage?: ReactNode;
}

const CardImage = ({ aspectRatio = CARD_IMAGE_ASPECT_RATIO_DEFAULT, defaultImage, ...props }: CardImageProps) => {
  if (defaultImage && !props.src) {
    return (
      <ImageWrapper sx={{ aspectRatio }} {...props}>
        {defaultImage}
      </ImageWrapper>
    );
  } else {
    return <Box component="img" display="block" width="100%" sx={{ aspectRatio, objectFit: 'cover' }} {...props} />;
  }
};

export default CardImage;
