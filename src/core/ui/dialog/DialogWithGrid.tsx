import React, { MouseEventHandler } from 'react';
import { Dialog as MuiDialog, DialogProps as MuiDialogProps, Paper, PaperProps } from '@mui/material';
import useCurrentBreakpoint from '../utils/useCurrentBreakpoint';
import GridContainer from '../grid/GridContainer';
import { GRID_COLUMNS_DESKTOP, GRID_COLUMNS_MOBILE, MAX_CONTENT_WIDTH_WITH_GUTTER_PX } from '../grid/constants';
import GridProvider from '../grid/GridProvider';
import GridItem, { GridItemProps } from '../grid/GridItem';

interface DialogContainerProps extends PaperProps {
  columns?: GridItemProps['columns'];
  centeredVertically?: boolean;
  onClose?: MouseEventHandler;
  fullScreen?: boolean;
}

const DialogContainer = ({
  columns,
  centeredVertically,
  onClose,
  children,
  fullScreen,
  ...paperProps
}: DialogContainerProps) => {
  const breakpoint = useCurrentBreakpoint();

  const handleContainerClick: MouseEventHandler = event => {
    if (event.target === event.currentTarget) {
      onClose?.(event);
    }
  };

  const containerColumns = breakpoint === 'xs' ? GRID_COLUMNS_MOBILE : GRID_COLUMNS_DESKTOP;

  return (
    <GridContainer
      maxWidth={MAX_CONTENT_WIDTH_WITH_GUTTER_PX}
      marginX="auto"
      flexGrow={1}
      justifyContent="center"
      height="100%"
      alignItems={centeredVertically ? 'center' : 'start'}
      onClick={handleContainerClick}
      disablePadding={fullScreen}
    >
      <GridProvider columns={containerColumns} force>
        <GridItem columns={columns}>
          <Paper {...paperProps}>
            <GridProvider columns={columns ?? containerColumns}>{children}</GridProvider>
          </Paper>
        </GridItem>
      </GridProvider>
    </GridContainer>
  );
};

interface DialogWithGridProps extends MuiDialogProps {
  columns?: GridItemProps['columns'];
  fullHeight?: boolean;
  centeredVertically?: boolean;
}

const DialogWithGrid = ({
  columns = 4,
  fullHeight = false,
  centeredVertically = true,
  onClose,
  fullScreen,
  ...dialogProps
}: DialogWithGridProps) => {
  const { sx } = dialogProps;

  return (
    <MuiDialog
      PaperComponent={DialogContainer}
      PaperProps={{ columns, centeredVertically, fullScreen } as PaperProps}
      onClose={onClose}
      fullScreen={fullScreen}
      {...dialogProps}
      sx={{
        '.MuiDialog-paper': {
          maxWidth: 'none',
          margin: 0,
          height: fullHeight ? '100%' : 'auto',
          maxHeight: fullScreen ? '100vh' : undefined,
        },
        ...sx,
      }}
    />
  );
};

export default DialogWithGrid;
