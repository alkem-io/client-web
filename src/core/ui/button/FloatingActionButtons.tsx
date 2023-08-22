import { Box, BoxProps, Fade } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import ScrollToTop from './ScrollToTop';

export interface FloatingActionButtonsProps extends BoxProps {
  visible?: boolean;
  floatingActions?: ReactNode;
}

const FloatingActionButtons: FC<FloatingActionButtonsProps> = ({ visible = true, floatingActions, ...boxProps }) => {
  return (
    <Fade in={visible}>
      <Box
        position="fixed"
        bottom={theme => theme.spacing(3)}
        right={theme => theme.spacing(3)}
        display="flex"
        flexDirection="column"
        justifyContent="center"
        {...boxProps}
      >
        <ScrollToTop />
        {floatingActions}
      </Box>
    </Fade>
  );
};

export default FloatingActionButtons;
