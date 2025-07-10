import { MouseEventHandler, ReactNode } from 'react';
import { Dialog as MuiDialog, DialogProps as MuiDialogProps, Paper, PaperProps } from '@mui/material';
import GridContainer from '../grid/GridContainer';
import { MAX_CONTENT_WIDTH_WITH_GUTTER_PX, useGlobalGridColumns, useScreenSize } from '../grid/constants';
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

export interface DialogWithGridProps extends MuiDialogProps {
  columns?: GridItemProps['columns'];
  fullHeight?: boolean;
  centeredVertically?: boolean;
  disableScrollLock?: boolean;
}

const DialogWithGrid = ({
  columns = 4,
  fullHeight = false,
  centeredVertically = true,
  onClose,
  fullScreen,
  ...dialogProps
}: DialogWithGridProps) => {
  const { isSmallScreen } = useScreenSize();
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
          maxWidth: '100vw',
          margin: 0,
          height: fullHeight ? '100%' : 'auto',
          maxHeight:
            fullScreen || isSmallScreen
              ? '100vh'
              : fullHeight
                ? 'calc(100vh - 32px)' /* 64px for header height */
                : '100%',
          ...(fullHeight && {
            height: 'auto',
            minHeight: 'auto', // Allows dialog to be smaller when content is minimal
          }),
        },
        ...sx,
      }}
    />
  );
};

export default DialogWithGrid;
