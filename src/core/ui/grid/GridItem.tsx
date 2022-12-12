import { Box, BoxProps } from '@mui/material';
import { useColumns } from './GridContext';
import { getColumnsWidth } from './utils';

export type GridItemProps = BoxProps & {
  columns?: number;
};

const GridItem = ({ columns, ...props }: GridItemProps) => {
  const gridColumns = useColumns();

  return (
    <Box
      flexBasis={columns ? getColumnsWidth(columns, gridColumns) : 0}
      flexGrow={columns ? 0 : 1}
      flexShrink={0}
      {...props}
    />
  );
};

export default GridItem;
