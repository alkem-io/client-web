import React from 'react';
import TableCell, { TableCellProps } from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';
import Loading from '@/core/ui/loading/Loading';

interface TableRowLoadingProps {
  colSpan?: TableCellProps['colSpan'];
}

const TableRowLoading = ({
  ref,
  colSpan,
}: TableRowLoadingProps & {
  ref?: React.Ref<HTMLTableRowElement>;
}) => {
  return (
    <TableRow ref={ref}>
      {/* Fixed height is needed because Spinner changes its size dynamically */}
      <TableCell colSpan={colSpan} sx={{ height: theme => theme.spacing(7) }}>
        <Loading />
      </TableCell>
    </TableRow>
  );
};

export default TableRowLoading;
