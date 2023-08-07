import { forwardRef } from 'react';
import { Paper, PaperProps, SxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { gutters, useGridItem } from '../grid/utils';
import GridProvider from '../grid/GridProvider';
import SwapColors from '../palette/SwapColors';
import { useDeclaredColumns } from '../grid/GridContext';
import { DroppableProvidedProps } from 'react-beautiful-dnd';

export interface PageContentBlockProps extends PaperProps, Partial<DroppableProvidedProps> {
  accent?: boolean;
  disablePadding?: boolean;
  disableGap?: boolean;
  halfWidth?: boolean;
  columns?: number;
}

const borderWidth = '1px';

const PageContentBlock = forwardRef<HTMLDivElement, PageContentBlockProps>(
  ({ accent = false, disablePadding = false, disableGap = false, halfWidth = false, columns, sx, ...props }, ref) => {
    const gridColumns = useDeclaredColumns();

    const getGridItemStyle = useGridItem();

    const columnsTaken = halfWidth ? gridColumns / 2 : columns;

    const mergedSx: Partial<SxProps<Theme>> = {
      padding: disablePadding ? undefined : theme => `calc(${gutters()(theme)} - ${borderWidth})`,
      display: disableGap ? undefined : 'flex',
      flexDirection: disableGap ? undefined : 'column',
      gap: disableGap ? undefined : gutters(),
      ...getGridItemStyle(columnsTaken),
      ...sx,
    };

    return (
      <SwapColors swap={accent}>
        <GridProvider columns={columnsTaken ?? gridColumns}>
          <Paper ref={ref} sx={mergedSx} variant="outlined" {...props} />
        </GridProvider>
      </SwapColors>
    );
  }
);

export default PageContentBlock;
