import { GRID_COLUMNS_BLOCK_WITH_CARDS } from '../grid/constants';
import GridContainer, { GridContainerProps } from '../grid/GridContainer';
import GridProvider from '../grid/GridProvider';
import useCurrentBreakpoint from '../utils/useCurrentBreakpoint';

export interface PageContentBlockGridProps extends GridContainerProps {
  cards?: boolean;
}

const PageContentBlockGrid = ({ cards = false, children, ...props }: PageContentBlockGridProps) => {
  const breakpoint = useCurrentBreakpoint();

  const columns = (gridColumns: number | undefined) =>
    cards ? (breakpoint === 'xs' ? 1 : GRID_COLUMNS_BLOCK_WITH_CARDS) : gridColumns!;

  return (
    <GridContainer {...props}>
      <GridProvider columns={columns}>{children}</GridProvider>
    </GridContainer>
  );
};

export default PageContentBlockGrid;
