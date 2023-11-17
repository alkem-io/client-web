import React, { forwardRef } from 'react';
import { Box, BoxProps } from '@mui/material';
import GridProvider from '../grid/GridProvider';
import { GUTTER_MUI } from '../grid/constants';
import GridItem from '../grid/GridItem';
import SkipLink from '../keyboardNavigation/SkipLink';
import { useCombinedRefs } from '../../../domain/shared/utils/useCombinedRefs';
import { BlockAnchorProvider, NextBlockAnchor } from '../keyboardNavigation/NextBlockAnchor';

export interface PageContentColumnProps extends BoxProps {
  columns: number;
}

/**
 * Sets the width of the column while also providing inner grid properties to the children.
 * @constructor
 */
const PageContentColumn = forwardRef<HTMLDivElement, PageContentColumnProps>(({ columns, children, ...props }, ref) => {
  const combinedRef = useCombinedRefs(null, ref);

  return (
    <GridItem columns={columns}>
      <Box ref={combinedRef} display="flex" flexWrap="wrap" alignContent="start" gap={GUTTER_MUI} {...props}>
        <GridProvider columns={columns}>
          <BlockAnchorProvider block={combinedRef.current}>
            {children}
            <NextBlockAnchor>
              <SkipLink />
            </NextBlockAnchor>
          </BlockAnchorProvider>
        </GridProvider>
      </Box>
    </GridItem>
  );
});

export default PageContentColumn;
