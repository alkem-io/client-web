import { Box, CircularProgress } from '@mui/material';
import { Caption } from '../typography';

export const Loading = ({ text = 'Loading' }: { text?: string }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
        gap: 2,
      }}
    >
      <CircularProgress sx={{ color: 'primary.main' }} />
      <Caption textTransform="uppercase" fontWeight="medium" color="primary.main">
        {text}
      </Caption>
    </Box>
  );
};

export default Loading;
