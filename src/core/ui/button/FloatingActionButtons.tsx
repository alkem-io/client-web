import { BoxProps, Fade } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import ScrollToTop from './ScrollToTop';
import { PLATFORM_NAVIGATION_MENU_Z_INDEX } from '../../../main/ui/platformNavigation/constants';
import Gutters from '../grid/Gutters';

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
        zIndex={PLATFORM_NAVIGATION_MENU_Z_INDEX + 1}
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
