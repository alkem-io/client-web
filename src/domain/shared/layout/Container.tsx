import { useMemo } from 'react';
import { Box, BoxProps } from '@mui/material';
import { getColsWidth, GUTTER } from './Grid';
import { Breakpoint } from '@mui/material/styles';
import { mapValues } from 'lodash';
import { useTheme } from '@mui/styles';

const COLUMNS_PER_BREAKPOINT: Record<Breakpoint, number> = {
  xl: 12,
  lg: 12,
  md: 8,
  sm: 6,
  xs: 4,
};

const Container = (props: BoxProps) => {
  const theme = useTheme();

  const maxWidth = useMemo(() => mapValues(COLUMNS_PER_BREAKPOINT, cols => getColsWidth(cols, theme)), [theme]);

  return (
    <Box
      maxWidth={maxWidth}
      marginX="auto"
      display="flex"
      flexDirection="column"
      alignItems="center"
      gap={GUTTER}
      {...props}
    />
  );
};

export default Container;
