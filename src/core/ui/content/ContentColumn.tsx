import React, { forwardRef } from 'react';
import { useColumns } from '../grid/GridContext';
import PageContentColumn from './PageContentColumn';
import { GRID_COLUMNS_MOBILE } from '../grid/constants';
import { BoxProps } from '@mui/material';

const CONTENT_COLUMNS = 9;

const ContentColumn = forwardRef<HTMLDivElement, BoxProps>(({ children, ...props }, ref) => {
  const fullWidthColumns = useColumns();
  const columnsToUse = fullWidthColumns === GRID_COLUMNS_MOBILE ? GRID_COLUMNS_MOBILE : CONTENT_COLUMNS;

  return (
    <PageContentColumn columns={columnsToUse} {...props} ref={ref}>
      {children}
    </PageContentColumn>
  );
});

export default ContentColumn;
