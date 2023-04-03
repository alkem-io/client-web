import { Dialog as MuiDialog, DialogProps as MuiDialogProps, Paper, PaperProps } from '@mui/material';
import useCurrentBreakpoint from '../utils/useCurrentBreakpoint';
import GridContainer from '../grid/GridContainer';
import { GRID_COLUMNS_DESKTOP, GRID_COLUMNS_MOBILE, MAX_CONTENT_WIDTH_WITH_GUTTER_PX } from '../grid/constants';
import GridProvider from '../grid/GridProvider';
import GridItem, { GridItemProps } from '../grid/GridItem';

interface DialogContainerProps extends PaperProps {
  columns?: GridItemProps['columns'];
}

const DialogContainer = ({ columns, ...paperProps }: DialogContainerProps) => {
  const breakpoint = useCurrentBreakpoint();

  return (
    <GridContainer
      maxWidth={MAX_CONTENT_WIDTH_WITH_GUTTER_PX}
      marginX="auto"
      flexGrow={1}
      justifyContent="center"
      height="100%"
    >
      <GridProvider columns={breakpoint === 'xs' ? GRID_COLUMNS_MOBILE : GRID_COLUMNS_DESKTOP}>
        <GridItem columns={columns}>
          <Paper {...paperProps} />
        </GridItem>
      </GridProvider>
    </GridContainer>
  );
};

interface DialogWithGridProps extends MuiDialogProps {
  columns?: GridItemProps['columns'];
  fullHeight?: boolean;
}

const DialogWithGrid = ({ columns = 4, fullHeight = false, ...dialogProps }: DialogWithGridProps) => {
  const { sx } = dialogProps;

  return (
    <MuiDialog
      PaperComponent={DialogContainer}
      PaperProps={{ columns } as PaperProps}
      {...dialogProps}
      sx={{ '.MuiDialog-paper': { maxWidth: 'none', margin: 0, height: fullHeight ? '100%' : 'auto' }, ...sx }}
    />
  );
};

export default DialogWithGrid;
