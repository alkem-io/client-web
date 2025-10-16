import React, { ReactElement } from 'react';
import { Box, BoxProps } from '@mui/material';
import { BoxTypeMap } from '@mui/system';
import { gutters } from './utils';
import { useScreenSize } from './constants';

export interface GuttersGridProps extends BoxProps {
  columns?: number; // default 2
}

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
GuttersGrid.displayName = 'Gutters';

export default GuttersGrid as <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>(
  props: GuttersGridProps & BoxProps<D, P>
) => ReactElement;
