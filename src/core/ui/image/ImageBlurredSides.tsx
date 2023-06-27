import { Box, BoxProps, useTheme } from '@mui/material';

type BlurRadius = number | string;
type Side = 'left' | 'right';

interface ImageBlurredSidesProps extends BoxProps<'img'> {
  blurRadius: BlurRadius;
}

interface BlurredSideProps {
  src?: string;
  side: Side;
  blurRadius: BlurRadius;
}

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

const ImageBlurredSides = ({ src, blurRadius, sx, ...props }: ImageBlurredSidesProps) => {
  return (
    <Box display="flex" justifyContent="center" alignItems="stretch">
      <BlurredSide src={src} blurRadius={blurRadius} side="left" />
      <BlurredSide src={src} blurRadius={blurRadius} side="right" />
      <Box component="img" src={src} {...props} flexShrink={0} sx={{ objectFit: 'cover', ...sx }} />
    </Box>
  );
};

export default ImageBlurredSides;
