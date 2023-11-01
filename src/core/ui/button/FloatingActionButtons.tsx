import { Box, BoxProps, Fade } from '@mui/material';
import React, { FC, ReactNode } from 'react';
import ScrollToTop from './ScrollToTop';
import { PLATFORM_NAVIGATION_MENU_Z_INDEX } from '../../../main/ui/platformNavigation/constants';

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
        alignItems="center"
        zIndex={PLATFORM_NAVIGATION_MENU_Z_INDEX + 1}
        {...boxProps}
      >
        <ScrollToTop />
        {floatingActions}
      </Box>
    </Fade>
  );
};

export default FloatingActionButtons;
