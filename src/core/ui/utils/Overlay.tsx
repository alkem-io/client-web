import { Box, BoxProps, SxProps, Theme } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { isNumber } from 'lodash';

const Overlay = ({ fade = false, sx, ...props }: { fade?: boolean | number } & BoxProps) => {
  const faderStyle: SxProps<Theme> = fade
    ? {
        '&:after': theme => ({
          content: '""',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          backgroundColor: alpha(theme.palette.background.paper, isNumber(fade) ? fade : 0.7),
        }),
      }
    : {};

  return (
    <Box
      position="absolute"
      top={0}
      left={0}
      bottom={0}
      right={0}
      overflow="hidden"
      sx={{
        ...faderStyle,
        ...sx,
      }}
      {...props}
    />
  );
};

export default Overlay;
