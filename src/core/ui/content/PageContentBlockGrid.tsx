import { GRID_COLUMNS_BLOCK_WITH_CARDS } from '../grid/constants';
import GridContainer, { GridContainerProps } from '../grid/GridContainer';
import GridProvider from '../grid/GridProvider';
import useCurrentBreakpoint from '../utils/useCurrentBreakpoint';
import { useColumns } from '../grid/GridContext';

export interface PageContentBlockGridProps extends GridContainerProps {
  cards?: boolean;
}

const PageContentBlockGrid = ({ cards = false, children, ...props }: PageContentBlockGridProps) => {
  const breakpoint = useCurrentBreakpoint();

  const parentColumns = useColumns();

  const columns = cards ? (breakpoint === 'xs' ? 1 : GRID_COLUMNS_BLOCK_WITH_CARDS) : parentColumns;

  return (
    <GridContainer {...props}>
      <GridProvider columns={columns}>{children}</GridProvider>
    </GridContainer>
  );
};

export default PageContentBlockGrid;
