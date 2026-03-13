import { Box, type BoxProps } from '@mui/material';
import type { BoxTypeMap } from '@mui/system';
import type React from 'react';
import type { ReactElement } from 'react';
import { useScreenSize } from './constants';
import { gutters } from './utils';

export interface GuttersGridProps extends BoxProps {
  columns?: number; // default 2
}

/**
 * Component based on Gutters
 * Creates a grid with with cells sepparated by gutters that turns into a single column on medium-small screens
 */
const GuttersGrid = ({
  ref,
  columns = 2,
  ...props
}: GuttersGridProps & {
  ref?: React.Ref<unknown>;
}) => {
  const { isMediumSmallScreen } = useScreenSize();
  const gridColumns = isMediumSmallScreen ? 'auto' : `${100 / columns}% `.repeat(columns).trim();

  return (
    <Box
      ref={ref}
      display="grid"
      gridTemplateColumns={gridColumns}
      rowGap={gutters()}
      columnGap={gutters()}
      {...props}
    />
  );
};
GuttersGrid.displayName = 'GuttersGrid';

export default GuttersGrid as <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>(
  props: GuttersGridProps & BoxProps<D, P>
) => ReactElement;
