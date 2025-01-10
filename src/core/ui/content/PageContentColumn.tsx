import { forwardRef } from 'react';
import { BoxProps } from '@mui/material';
import GridItem from '../grid/GridItem';
import PageContentColumnBase from './PageContentColumnBase';

export interface PageContentColumnProps extends BoxProps {
  columns: number;
}

/**
 * Sets the width of the column while also providing inner grid properties to the children.
 * @constructor
 */
const PageContentColumn = forwardRef<HTMLDivElement, PageContentColumnProps>(({ columns, ...props }, ref) => (
  <GridItem columns={columns}>
    <PageContentColumnBase columns={columns} {...props} ref={ref} />
  </GridItem>
));
PageContentColumn.displayName = 'PageContentColumn';

export default PageContentColumn;
