import { MouseEventHandler, ReactNode } from 'react';
import { Box, BoxProps, ButtonBase, styled } from '@mui/material';
import ImageFadeIn from './ImageFadeIn';
import { gutters } from '../grid/utils';
import hexToRGBA from '@/core/utils/hexToRGBA';
import { Caption } from '../typography';
import Centered from '../utils/Centered';

interface ImageWithCaptionProps extends BoxProps<'img'> {
  caption: ReactNode | string;
  captionPosition?: 'top' | 'bottom';
  defaultImage?: ReactNode;
  onClick?: MouseEventHandler;
}

const Container = styled(ButtonBase)(({ theme }) => ({
  position: 'relative',
  height: gutters(13)(theme),
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  borderRadius: theme.shape.borderRadius,
}));

const CaptionContainer = styled(Box)(({ theme }) => ({
  position: 'absolute',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  width: '100%',
  height: gutters(2)(theme),
  backgroundColor: hexToRGBA(theme.palette.common.white, 0.8),
}));

const ImageWithCaption = ({
  caption,
  captionPosition = 'bottom',
  onClick,
  defaultImage,
  ...imgProps
}: ImageWithCaptionProps) => {
  return (
    <Container onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default' }}>
      {!imgProps.src && defaultImage && <Centered>{defaultImage}</Centered>}
      {imgProps.src && <ImageFadeIn sx={{ minHeight: '100%' }} {...imgProps} />}
      <CaptionContainer
        sx={{
          top: captionPosition === 'top' ? 0 : undefined,
          bottom: captionPosition === 'bottom' ? 0 : undefined,
        }}
      >
        <Caption color={theme => theme.palette.primary.main}>{caption}</Caption>
      </CaptionContainer>
    </Container>
  );
};

export default ImageWithCaption;
