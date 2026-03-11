import { Box, type BoxProps } from '@mui/material';
import type { BoxTypeMap } from '@mui/system';
import type React from 'react';
import type { ReactElement } from 'react';
import { gutters } from './utils';

export interface GuttersProps extends BoxProps {
  row?: boolean;
  disablePadding?: boolean;
  disableVerticalPadding?: boolean;
  disableSidePadding?: boolean;
  disableGap?: boolean;
  fullHeight?: boolean;
}

const Gutters = ({
  ref,
  row = false,
  disablePadding = false,
  disableVerticalPadding = false,
  disableSidePadding = false,
  disableGap = false,
  fullHeight = false,
  ...props
}: GuttersProps & {
  ref?: React.Ref<unknown>;
}) => {
  return (
    <Box
      ref={ref}
      display="flex"
      flexDirection={row ? 'row' : 'column'}
      paddingX={disableSidePadding || disablePadding ? 0 : gutters()}
      paddingY={disableVerticalPadding || disablePadding ? 0 : gutters()}
      gap={disableGap ? undefined : gutters()}
      {...(fullHeight
        ? {
            height: '100%',
            justifyContent: 'space-between',
          }
        : undefined)}
      {...props}
    />
  );
};
Gutters.displayName = 'Gutters';

export default Gutters as <D extends React.ElementType = BoxTypeMap['defaultComponent'], P = {}>(
  props: GuttersProps & BoxProps<D, P>
) => ReactElement;
