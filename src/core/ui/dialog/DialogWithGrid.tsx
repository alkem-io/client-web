import { MouseEventHandler, ReactNode } from 'react';
import { Dialog as MuiDialog, DialogProps as MuiDialogProps, Paper, PaperProps } from '@mui/material';
import GridContainer from '../grid/GridContainer';
import { MAX_CONTENT_WIDTH_WITH_GUTTER_PX, useGlobalGridColumns } from '../grid/constants';
import GridProvider from '../grid/GridProvider';
import GridItem, { GridItemProps } from '../grid/GridItem';

interface DialogContainerProps extends PaperProps {
  columns?: GridItemProps['columns'];
  centeredVertically?: boolean;
  onClose?: MouseEventHandler;
  fullScreen?: boolean;
}

export const DialogFooter = ({ children }: { children?: ReactNode }) => <>{children}</>;

const DialogContainer = ({
  columns,
  centeredVertically,
  onClose,
  children,
  fullScreen,
  ...paperProps
}: DialogContainerProps) => {
  const handleContainerClick: MouseEventHandler = event => {
    if (event.target === event.currentTarget) {
      onClose?.(event);
    }
  };

  const containerColumns = useGlobalGridColumns();

  return (
    <GridContainer
      maxWidth={fullScreen ? undefined : MAX_CONTENT_WIDTH_WITH_GUTTER_PX}
      marginX="auto"
      flexGrow={1}
      justifyContent="center"
      height="100%"
      alignItems={centeredVertically ? 'center' : 'start'}
      onClick={handleContainerClick}
      disablePadding={fullScreen}
      sx={{ paddingY: fullScreen ? 0 : 4 }}
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

export interface DialogWithGridProps extends MuiDialogProps {
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
      slotProps={{
        paper: {
          columns,
          centeredVertically,
          fullScreen,
        } as PaperProps,
      }}
      onClose={onClose}
      fullScreen={fullScreen}
      {...dialogProps}
      sx={{
        '.MuiDialog-paper': {
          maxWidth: '100vw',
          margin: 0,
          height: 'auto',
          maxHeight: fullScreen ? '100vh' : '100%',
          ...(fullHeight && {
            minHeight: 'auto',
          }),
        },
        ...sx,
      }}
    />
  );
};

export default DialogWithGrid;
