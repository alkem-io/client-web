import { BoxProps, Fade } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import ScrollToTop from './ScrollToTop';
import Gutters from '../grid/Gutters';

const NAVIGATION_FLOATING_ACTION_BUTTONS_Z_INDEX = 1200; // Dialogs are 1300
export interface FloatingActionButtonsProps extends BoxProps {
  visible?: boolean;
  floatingActions?: ReactNode;
}

const FloatingActionButtons: FC<FloatingActionButtonsProps> = ({ visible = true, floatingActions, ...boxProps }) => {
  return (
    <Fade in={visible}>
      <Gutters
        position="fixed"
        bottom={0}
        right={0}
        justifyContent="center"
        alignItems="center"
        zIndex={NAVIGATION_FLOATING_ACTION_BUTTONS_Z_INDEX}
        maxHeight="100vh"
        {...boxProps}
      >
        <ScrollToTop />
        {floatingActions}
      </Gutters>
    </Fade>
  );
};

export default FloatingActionButtons;
