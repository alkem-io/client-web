import { PropsWithChildren, ReactNode } from 'react';
import { Box, Modal, ModalProps } from '@mui/material';

interface FlexColumnGrowDialogProps extends Omit<ModalProps, 'children'> {
  header?: ReactNode;
  footer?: ReactNode;
}

const FlexColumnGrowDialog = ({
  header,
  footer,
  children,
  ...modalProps
}: PropsWithChildren<FlexColumnGrowDialogProps>) => {
  return (
    <Modal {...modalProps}>
      <Box display="flex" flexDirection="row" alignItems="center" height="100%">
        <Box
          flexGrow={1}
          flexShrink={1}
          display="flex"
          flexDirection="column"
          maxHeight="100%"
          alignItems="stretch"
          sx={{ backgroundColor: 'background.paper' }}
        >
          {header}
          <Box sx={{ overflowY: 'auto' }}>{children}</Box>
          {footer}
        </Box>
      </Box>
    </Modal>
  );
};

export default FlexColumnGrowDialog;
