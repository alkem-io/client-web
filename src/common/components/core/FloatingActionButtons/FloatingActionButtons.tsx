import { Box, BoxProps, Fade } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import HelpButton from './HelpButton/HelpButton';
import ScrollToTop from './ScrollToTop/ScrollToTop';

export interface FloatingActionButtonsProps extends BoxProps {
  visible?: boolean;
  children?: ReactNode; // Passing children to FloatingActionButtons overrides the default HelpButton
}

const FloatingActionButtons: FC<FloatingActionButtonsProps> = ({ visible = true, children, ...boxProps }) => {
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
        {children ?? <HelpButton />}
      </Box>
    </Fade>
  );
};

export default FloatingActionButtons;
