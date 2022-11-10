import { Box, Fade, useTheme } from '@mui/material';
import React, { FC } from 'react';
import ScrollToTop from './ScrollToTop/ScrollToTop';

export interface FloatingActionButtonsProps {
  visible?: boolean;
}

const FloatingActionButtons: FC<FloatingActionButtonsProps> = ({ visible = true }) => {
  const theme = useTheme();

  return (
    <Fade in={visible}>
      <Box position="fixed" zIndex={theme.zIndex.snackbar - 50} bottom={24} right={24}>
        <ScrollToTop />
      </Box>
    </Fade>
  );
};

export default FloatingActionButtons;
