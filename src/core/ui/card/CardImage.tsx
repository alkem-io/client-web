import { ReactNode } from 'react';
import { Box, BoxProps } from '@mui/material';
import Centered from '../utils/Centered';

export const CARD_IMAGE_ASPECT_RATIO_DEFAULT = '16/10';

interface CardImageProps extends BoxProps<'img'> {
  aspectRatio?: string;
  defaultImage?: ReactNode;
}

const CardImage = ({ aspectRatio = CARD_IMAGE_ASPECT_RATIO_DEFAULT, defaultImage, ...props }: CardImageProps) => {
  if (defaultImage && !props.src) {
    return (
      <Centered sx={{ aspectRatio }} {...props}>
        {defaultImage}
      </Centered>
    );
  } else {
    return <Box component="img" display="block" width="100%" sx={{ aspectRatio, objectFit: 'cover' }} {...props} />;
  }
};

export default CardImage;
