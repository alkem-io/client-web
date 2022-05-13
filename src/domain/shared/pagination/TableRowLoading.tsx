import React, { forwardRef } from 'react';
import TableCell, { TableCellProps } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import { Loading } from '../../../components/core';

interface TableRowLoadingProps {
  colSpan?: TableCellProps['colSpan'];
}

const TableRowLoading = forwardRef<HTMLTableRowElement, TableRowLoadingProps>(({ colSpan }, ref) => {
  return (
    <TableRow ref={ref}>
      {/* Fixed height is needed because Spinner changes its size dynamically */}
      <TableCell colSpan={colSpan} sx={{ height: theme => theme.spacing(7) }}>
        <Loading />
      </TableCell>
    </TableRow>
  );
});

export default TableRowLoading;
