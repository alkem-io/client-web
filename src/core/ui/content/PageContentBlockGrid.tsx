import { cardsGridColumns } from '../grid/constants';
import GridContainer, { type GridContainerProps } from '../grid/GridContainer';
import { useColumns } from '../grid/GridContext';
import GridProvider from '../grid/GridProvider';

export interface PageContentBlockGridProps extends GridContainerProps {
  cards?: boolean;
}

const PageContentBlockGrid = ({ cards = false, children, ...props }: PageContentBlockGridProps) => {
  const parentColumns = useColumns();

  const columns = cards ? cardsGridColumns(parentColumns) : parentColumns;

  return (
    <GridContainer {...props}>
      <GridProvider columns={columns} force={cards}>
        {children}
      </GridProvider>
    </GridContainer>
  );
};

export default PageContentBlockGrid;
