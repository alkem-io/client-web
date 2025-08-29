import { Box, BoxProps, useTheme } from '@mui/material';
import Image from './Image';

type BlurRadius = number | string;
type Side = 'left' | 'right';

interface ImageBlurredSidesProps extends BoxProps<'img'> {
  blurRadius: BlurRadius;
  containerProps?: BoxProps;
}

type BlurredSideProps = {
  src?: string;
  side: Side;
  blurRadius: BlurRadius;
};

const BlurredSide = ({ src, side, blurRadius }: BlurredSideProps) => {
  const theme = useTheme();
  const offset = theme.spacing(-blurRadius * 2);

  return (
    <Box
      flexGrow={1}
      order={side === 'right' ? 1 : 0}
      minWidth={0}
      position="relative"
      overflow="hidden"
      role="presentation"
      sx={{
        ':after': {
          content: '""',
          display: 'block',
          position: 'absolute',
          backgroundImage: `url(${src})`,
          backgroundPosition: `${side} center`,
          backgroundSize: 'auto 200%',
          top: offset,
          bottom: offset,
          left: offset,
          right: offset,
          filter: `blur(${typeof blurRadius === 'string' ? blurRadius : theme.spacing(blurRadius)})`,
        },
      }}
    />
  );
};

const ImageBlurredSides = ({ src, blurRadius, sx, containerProps, ...props }: ImageBlurredSidesProps) => (
  <Box display="flex" justifyContent="center" alignItems="stretch" {...containerProps} role="presentation">
    <BlurredSide src={src} blurRadius={blurRadius} side="left" />
    <BlurredSide src={src} blurRadius={blurRadius} side="right" />
    <Image src={src} {...props} flexShrink={0} sx={{ objectFit: 'cover', ...sx }} />
  </Box>
);

export default ImageBlurredSides;
