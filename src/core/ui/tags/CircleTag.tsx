import { Box, Typography } from '@mui/material';

const CircleTag = ({ count }: { count: number }) => {
  return (
    <Box sx={{ borderRadius: '50%', borderStyle: 'solid', borderWidth: 1, textAlign: 'center', width: 22 }}>
      <Typography variant="body1">{count}</Typography>
    </Box>
  );
};

export default CircleTag;
