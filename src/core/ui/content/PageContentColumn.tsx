import { BoxProps } from '@mui/material';
import GridProvider from '../grid/GridProvider';
import GridItem from '../grid/GridItem';
import { useColumns } from '../grid/GridContext';
import { GUTTER_MUI } from '../grid/constants';

export interface PageContentColumnProps extends BoxProps {
  columns: number;
}

/**
 * Sets the width of the column while also providing inner grid properties to the children.
 * @constructor
 */
const PageContentColumn = ({ columns, children, ...props }: PageContentColumnProps) => {
  const gridColumns = useColumns();

  const nestedGridColumns = Math.min(columns, gridColumns);

  return (
    <GridItem columns={columns} display="flex" flexWrap="wrap" alignContent="start" gap={GUTTER_MUI} {...props}>
      <GridProvider columns={nestedGridColumns}>{children}</GridProvider>
    </GridItem>
  );
};

export default PageContentColumn;
