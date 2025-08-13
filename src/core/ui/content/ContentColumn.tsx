import PageContentColumn from './PageContentColumn';
import { BoxProps } from '@mui/material';
import { useColumns } from '../grid/GridContext';
import { GRID_COLUMNS_MOBILE } from '../grid/constants';

// GRID COLUMNS - INFO_COLUMNS => 12 - 3
const CONTENT_COLUMNS = 9;
const INFO_COLUMNS = 3;

const ContentColumn = ({
  ref,
  children,
  ...props
}: BoxProps & {
  ref?: React.Ref<HTMLDivElement>;
}) => {
  const availableColumns = useColumns();

  let columnsToUse = CONTENT_COLUMNS;

  if (availableColumns === GRID_COLUMNS_MOBILE) {
    // On mobile, use full width
    columnsToUse = GRID_COLUMNS_MOBILE;
  } else if (availableColumns < 12) {
    // On tablet (8 columns), use remaining columns after info column
    columnsToUse = availableColumns - INFO_COLUMNS;
  }

  return (
    <PageContentColumn columns={columnsToUse} {...props} ref={ref}>
      {children}
    </PageContentColumn>
  );
};

export default ContentColumn;
