import { useColumns } from '../grid/GridContext';
import { BoxProps } from '@mui/material';
import PageContentColumn from './PageContentColumn';
import { GRID_COLUMNS_MOBILE } from '../grid/constants';

// GRID COLUMNS - CONTENT_COLUMNS => 12 - 9
const INFO_COLUMNS = 3;

const InfoColumn = ({
  ref,
  children,
  ...props
}: BoxProps & {
  ref: React.RefObject<HTMLDivElement>;
}) => {
  const availableColumns = useColumns();
  const columnsToUse = availableColumns === GRID_COLUMNS_MOBILE ? GRID_COLUMNS_MOBILE : INFO_COLUMNS;

  return (
    <PageContentColumn columns={columnsToUse} {...props} ref={ref}>
      {children}
    </PageContentColumn>
  );
};

export default InfoColumn;
