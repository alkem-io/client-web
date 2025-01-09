import { Box, CircularProgress } from '@mui/material';
import WrapperTypography from '../typography/deprecated/WrapperTypography';

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
      <WrapperTypography variant="caption" color="primary">
        {text}
      </WrapperTypography>
    </Box>
  );
};

export default Loading;
