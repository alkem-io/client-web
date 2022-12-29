import { forwardRef } from 'react';
import { Box, BoxProps, SxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import { gutters, useGridItem } from '../grid/utils';
import GridProvider from '../grid/GridProvider';
import { useDeclaredColumns } from '../grid/GridContext';

export interface PageContentBlockSeamlessProps extends BoxProps {
  disablePadding?: boolean;
  disableGap?: boolean;
  halfWidth?: boolean;
  columns?: number;
}

const PageContentBlockSeamless = forwardRef<HTMLDivElement, PageContentBlockSeamlessProps>(
  ({ disablePadding = false, disableGap = false, halfWidth = false, columns, sx, ...props }, ref) => {
    const gridColumns = useDeclaredColumns();

    const getGridItemStyle = useGridItem();

    const columnsTaken = halfWidth ? gridColumns / 2 : columns;

    const mergedSx: Partial<SxProps<Theme>> = {
      padding: disablePadding ? undefined : gutters(),
      display: disableGap ? undefined : 'flex',
      flexDirection: disableGap ? undefined : 'column',
      gap: disableGap ? undefined : gutters(),
      ...getGridItemStyle(columnsTaken),
      ...sx,
    };

    return (
      <GridProvider columns={columnsTaken ?? gridColumns}>
        <Box ref={ref} sx={mergedSx} {...props} />
      </GridProvider>
    );
  }
);

export default PageContentBlockSeamless;
