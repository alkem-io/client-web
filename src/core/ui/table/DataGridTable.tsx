import { IconButton, styled } from '@mui/material';
import { DataGrid, DataGridProps, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Identifiable } from '@/core/utils/Identifiable';
import { ReactNode, useMemo } from 'react';
import { CardText } from '../typography';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';
import TranslationKey from '@/core/i18n/utils/TranslationKey';
import { GUTTER_PX } from '../grid/constants';

export const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '.MuiDataGrid-columnHeaders': {
    color: theme.palette.primary.contrastText,
    background: theme.palette.primary.main,
    '.MuiDataGrid-row--borderBottom': {
      background: theme.palette.primary.main,
    },
    '.MuiIconButton-root': {
      color: theme.palette.primary.contrastText,
    },
  },
  '.MuiDataGrid-row:nth-of-type(odd)': {
    background: theme.palette.background.default,
  },
  '.MuiDataGrid-row:nth-of-type(even)': {
    background: theme.palette.background.paper,
  },
  '.MuiDataGrid-columnSeparator': {
    color: 'transparent',
  },
  '.MuiDataGrid-cell': {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
  },
  '.MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell:focus': {
    outline: 'none',
  },
})) as typeof DataGrid;

interface Action<Item extends Identifiable> {
  name: string;
  render: (params: GridRenderCellParams<Item>) => ReactNode;
}

const actionDefaultProps: Partial<GridColDef> = {
  width: 30,
  resizable: false,
  headerName: '',
  sortable: false,
  filterable: false,
  disableColumnMenu: true,
};

interface DataGridTableProps<Item extends Identifiable> extends Omit<DataGridProps<Item>, 'columns'> {
  rows: Item[];
  columns: GridColDef<Item>[];
  actions?: Action<Item>[];
  canDelete?: (item: Item) => boolean;
  disableDelete?: (item: Item) => boolean;
  onDelete?: (item: Item) => void;
  dependencies?: unknown[];
}

const alwaysTrue = () => true;

const alwaysFalse = () => false;

const getRowHeight = () => GUTTER_PX * 2;

const DataGridTable = <Item extends Identifiable>({
  rows,
  columns,
  actions,
  onDelete,
  canDelete = alwaysTrue,
  disableDelete = alwaysFalse,
  dependencies = [],
  ...props
}: DataGridTableProps<Item>) => {
  const { t } = useTranslation();

  const columnDefinitions = useMemo<GridColDef<Item>[]>(
    () =>
      columns.map(column => {
        return {
          headerName: t(`fields.${column.field}` as TranslationKey) as string,
          renderHeader: ({ colDef }) => <CardText fontWeight="bold">{colDef.headerName}</CardText>,
          resizable: true,
          ...column,
        };
      }),
    [t, ...dependencies]
  );

  const actionColumnDefinitions = useMemo<GridColDef<Item>[]>(() => {
    const actionDefinitions = [...(actions ?? [])];

    if (onDelete) {
      actionDefinitions.push({
        name: 'delete',
        render: ({ row }: { row: Item }) =>
          canDelete(row) && (
            <IconButton onClick={() => onDelete(row)} disabled={disableDelete(row)} aria-label={t('buttons.delete')}>
              <DeleteOutlineIcon color={disableDelete(row) ? 'disabled' : 'warning'} />
            </IconButton>
          ),
      });
    }

    return actionDefinitions.map(({ name, render }) => {
      return {
        ...actionDefaultProps,
        field: name,
        renderCell: render,
      };
    });
  }, [onDelete, ...dependencies]);

  const mergedColumnDefinitions = useMemo(
    () => [...columnDefinitions, ...actionColumnDefinitions],
    [columnDefinitions, actionColumnDefinitions]
  );

  return (
    <StyledDataGrid
      isRowSelectable={alwaysFalse}
      rows={rows}
      columns={mergedColumnDefinitions}
      columnHeaderHeight={getRowHeight()}
      getRowHeight={getRowHeight}
      {...props}
    />
  );
};

export default DataGridTable;
