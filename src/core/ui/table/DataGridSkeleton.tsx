import { Skeleton } from '@mui/material';
import { StyledDataGrid } from './DataGridTable';
import { GridColDef } from '@mui/x-data-grid';
import { times } from 'lodash';
import { FC } from 'react';

interface DataGridSkeletonProps {
  rowsCount?: number;
}

const DataGridSkeleton: FC<DataGridSkeletonProps> = ({ rowsCount = 5 }) => {
  const columns: GridColDef[] = [
    {
      field: 'loading',
      headerName: '',
      renderHeader: () => <></>,
      renderCell: () => <Skeleton width="100%" />,
      filterable: false,
      sortable: false,
      resizable: false,
      flex: 1,
    },
  ];

  const alwaysFalse = () => false;
  const rows = times(rowsCount, index => ({ id: index }));

  return <StyledDataGrid isRowSelectable={alwaysFalse} rows={rows} columns={columns} autoHeight />;
};

export default DataGridSkeleton;
