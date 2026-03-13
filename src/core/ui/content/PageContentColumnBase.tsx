import { Box, type BoxProps } from '@mui/material';
import { useCombinedRefs } from '@/domain/shared/utils/useCombinedRefs';
import { GUTTER_MUI } from '../grid/constants';
import GridProvider from '../grid/GridProvider';
import { BlockAnchorProvider, NextBlockAnchor } from '../keyboardNavigation/NextBlockAnchor';
import SkipLink from '../keyboardNavigation/SkipLink';

export interface PageContentColumnBaseProps extends BoxProps {
  columns: number;
}

/**
 * Grid container for page content blocks.
 * @constructor
 */
const PageContentColumnBase = ({
  ref,
  columns,
  children,
  ...props
}: PageContentColumnBaseProps & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const combinedRef = useCombinedRefs<HTMLDivElement | null>(null, ref);

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
};
PageContentColumnBase.displayName = 'PageContentColumnBase';

export default PageContentColumnBase;
