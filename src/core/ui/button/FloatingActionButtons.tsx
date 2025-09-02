import { BoxProps, Fade } from '@mui/material';
import { ReactNode } from 'react';
import ScrollToTop from './ScrollToTop';
import Gutters from '../grid/Gutters';

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
