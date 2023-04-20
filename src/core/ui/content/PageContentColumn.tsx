import React, { forwardRef } from 'react';
import { Box, BoxProps } from '@mui/material';
import GridProvider from '../grid/GridProvider';
import { GUTTER_MUI } from '../grid/constants';
import GridItem from '../grid/GridItem';

export interface PageContentColumnProps extends BoxProps {
  columns: number;
}

/**
 * Sets the width of the column while also providing inner grid properties to the children.
 * @constructor
 */
const PageContentColumn = forwardRef<HTMLDivElement, PageContentColumnProps>(({ columns, children, ...props }, ref) => {
  return (
    <GridItem columns={columns}>
      <Box ref={ref} display="flex" flexWrap="wrap" alignContent="start" gap={GUTTER_MUI} {...props}>
        <GridProvider columns={columns}>{children}</GridProvider>
      </Box>
    </GridItem>
  );
});

export default PageContentColumn;
