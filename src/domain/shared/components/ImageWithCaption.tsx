import { FC, ReactNode } from 'react';
import { Box, BoxProps, styled } from '@mui/material';
import Image from './Image';
import { gutters } from '../../../core/ui/grid/utils';
import hexToRGBA from '../../../common/utils/hexToRGBA';
import { Caption } from '../../../core/ui/typography';

interface ImageWithCaptionProps extends BoxProps<'img'> {
  caption: ReactNode | string;
  captionPosition?: 'top' | 'bottom';
}

const Container = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: gutters(13)(theme),
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  '> img': {
    minHeight: '100%',
  },
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

const ImageWithCaption: FC<ImageWithCaptionProps> = ({ caption, captionPosition = 'bottom', onClick, ...imgProps }) => {
  return (
    <Container onClick={onClick} sx={{ cursor: onClick ? 'pointer' : 'default' }}>
      <Image {...imgProps} src="https://images.hdqwalls.com/wallpapers/matterhorn-mountains-ap.jpg" />
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
