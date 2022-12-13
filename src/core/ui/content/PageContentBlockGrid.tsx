import { BoxProps, PaperProps } from '@mui/material';
import { GRID_COLUMNS_BLOCK_WITH_CARDS } from '../grid/constants';
import GridContainer from '../grid/GridContainer';
import { useColumns } from '../grid/GridContext';
import GridProvider from '../grid/GridProvider';
import useCurrentBreakpoint from '../utils/useCurrentBreakpoint';

interface PageContentBlockGridProps {
  cards?: boolean;
}

const PageContentBlockGrid = ({
  cards = false,
  children,
  ...props
}: BoxProps & PaperProps & PageContentBlockGridProps) => {
  const gridColumns = useColumns();

  const breakpoint = useCurrentBreakpoint();

  const columns = cards ? (breakpoint === 'xs' ? 1 : GRID_COLUMNS_BLOCK_WITH_CARDS) : gridColumns;

  return (
    <GridContainer {...props}>
      <GridProvider columns={columns}>{children}</GridProvider>
    </GridContainer>
  );
};

export default PageContentBlockGrid;
