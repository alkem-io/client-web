import { forwardRef } from 'react';
import { Box, BoxProps } from '@mui/material';
import GridProvider from '../grid/GridProvider';
import { GUTTER_MUI } from '../grid/constants';
import SkipLink from '../keyboardNavigation/SkipLink';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';
import { BlockAnchorProvider, NextBlockAnchor } from '../keyboardNavigation/NextBlockAnchor';

export interface PageContentColumnBaseProps extends BoxProps {
  columns: number;
}

/**
 * Grid container for page content blocks.
 * @constructor
 */
const PageContentColumnBase = forwardRef<HTMLDivElement, PageContentColumnBaseProps>(
  ({ columns, children, ...props }, ref) => {
    const combinedRef = useCombinedRefs(null, ref);

    return (
      <Box ref={combinedRef} display="flex" flexWrap="wrap" alignContent="start" gap={GUTTER_MUI} {...props}>
        <GridProvider columns={columns}>
          <BlockAnchorProvider blockRef={combinedRef}>
            {children}
            <NextBlockAnchor>
              <SkipLink />
            </NextBlockAnchor>
          </BlockAnchorProvider>
        </GridProvider>
      </Box>
    );
  }
);

export default PageContentColumnBase;
