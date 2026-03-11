import { type BoxProps, Fade } from '@mui/material';
import type { ReactNode } from 'react';
import Gutters from '../grid/Gutters';
import ScrollToTop from './ScrollToTop';

const FLOATING_ACTION_BUTTONS_Z_INDEX = 1200; // Dialogs are 1300
export interface FloatingActionButtonsProps extends BoxProps {
  visible?: boolean;
  floatingActions?: ReactNode;
}

const FloatingActionButtons = ({ visible = true, floatingActions, ...boxProps }: FloatingActionButtonsProps) => {
  return (
    <Fade in={visible}>
      <Gutters
        position="fixed"
        bottom={0}
        right={0}
        justifyContent="center"
        alignItems="center"
        zIndex={FLOATING_ACTION_BUTTONS_Z_INDEX}
        maxHeight="100vh"
        component="aside"
        {...boxProps}
      >
        <ScrollToTop />
        {floatingActions}
      </Gutters>
    </Fade>
  );
};

export default FloatingActionButtons;
