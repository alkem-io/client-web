import React, { ReactElement } from 'react';
import { Box, BoxProps } from '@mui/material';
import { BoxTypeMap } from '@mui/system';
import { gutters } from './utils';
import { useScreenSize } from './constants';

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
  const gridColumns = isMediumSmallScreen ? 'auto' : (100 / columns + '% ').repeat(columns).trim();

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
