import { Box, BoxProps } from '@mui/material';

const CardDetails = ({ transparent = false, sx, ...boxProps }: { transparent?: boolean } & BoxProps) => {
  const mergedSx: BoxProps['sx'] = {
    backgroundColor: transparent ? undefined : 'background.default',
    display: 'flex',
    flexDirection: 'column',
    ...sx,
  };

  return <Box sx={mergedSx} {...boxProps} />;
};

export default CardDetails;
