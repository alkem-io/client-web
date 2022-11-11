import { Box, BoxProps, Fade } from '@mui/material';
import React, { FC } from 'react';
import HelpButton from './HelpButton/HelpButton';
import ScrollToTop from './ScrollToTop/ScrollToTop';

export interface FloatingActionButtonsProps extends BoxProps {
  visible?: boolean;
}

const FloatingActionButtons: FC<FloatingActionButtonsProps> = ({ visible = true, ...boxProps }) => {
  return (
    <Fade in={visible}>
      <Box position="fixed" bottom={theme => theme.spacing(3)} right={theme => theme.spacing(3)} {...boxProps}>
        <ScrollToTop />
        <HelpButton />
      </Box>
    </Fade>
  );
};

export default FloatingActionButtons;
