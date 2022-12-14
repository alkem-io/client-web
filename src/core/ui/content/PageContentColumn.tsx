import { Box, BoxProps } from '@mui/material';
import GridProvider from '../grid/GridProvider';
import { GUTTER_MUI } from '../grid/constants';
import { useGridItem } from '../grid/utils';

interface PageContentColumnProps extends BoxProps {
  columns: number;
}

/**
 * Sets the width of the column while also providing inner grid properties to the children.
 * @constructor
 */
const PageContentColumn = ({ columns, children, ...props }: PageContentColumnProps) => {
  const getGridItemStyle = useGridItem();

  return (
    <Box display="flex" flexWrap="wrap" alignContent="start" gap={GUTTER_MUI} {...getGridItemStyle(columns)} {...props}>
      <GridProvider columns={parentGridColumns => Math.min(columns, parentGridColumns!)}>{children}</GridProvider>
    </Box>
  );
};

export default PageContentColumn;
