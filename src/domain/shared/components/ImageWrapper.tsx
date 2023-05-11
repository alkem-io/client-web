import { Box, styled } from '@mui/material';

export const ImageWrapper = styled(Box)(({ theme }) => ({
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
