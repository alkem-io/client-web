import { cardsGridColumns } from '../grid/constants';
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

  const columns = cards ? cardsGridColumns(breakpoint, parentColumns) : parentColumns;

  return (
    <GridContainer {...props}>
      <GridProvider columns={columns} force={cards}>
        {children}
      </GridProvider>
    </GridContainer>
  );
};

export default PageContentBlockGrid;
