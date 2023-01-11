import React from 'react';
import { Box, BoxProps, styled } from '@mui/material';

export const CARD_IMAGE_ASPECT_RATIO_DEFAULT = '16/10';

interface CardImageProps extends BoxProps<'img'> {
  aspectRatio?: string;
  defaultImageSvg?: JSX.Element;
}

const SvgWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: '100%',
  color: theme.palette.primary.main,
  '& > svg': {
    fontSize: '5em',
  },
}));

const CardImage = ({ aspectRatio = CARD_IMAGE_ASPECT_RATIO_DEFAULT, defaultImageSvg, ...props }: CardImageProps) => {
  if (defaultImageSvg && !props.src) {
    return (
      <SvgWrapper sx={{ aspectRatio }} {...props}>
        {defaultImageSvg}
      </SvgWrapper>
    );
  } else {
    return <Box component="img" display="block" width="100%" sx={{ aspectRatio, objectFit: 'cover' }} {...props} />;
  }
};

export default CardImage;
