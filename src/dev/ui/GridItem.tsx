import { Box, BoxProps } from '@mui/material';
import { useColumns } from '../../core/ui/grid/GridContext';
import { getColumnsWidth } from '../../core/ui/grid/utils';

export type GridItemProps = BoxProps & {
  columns?: number;
};

/**
 * @deprecated - used for Demo only
 */
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
