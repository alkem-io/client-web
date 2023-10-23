import { IconButton, styled } from '@mui/material';
import { DataGrid, DataGridProps, GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import { Identifiable } from '../../utils/Identifiable';
import { ReactNode, useMemo } from 'react';
import { CardText } from '../typography';
import SwapColors from '../palette/SwapColors';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useTranslation } from 'react-i18next';
import TranslationKey from '../../i18n/utils/TranslationKey';
import { GUTTER_PX } from '../grid/constants';

export const StyledDataGrid = styled(DataGrid)(({ theme }) => ({
  '.MuiDataGrid-columnHeaders': {
    color: theme.palette.primary.contrastText,
    background: theme.palette.primary.main,
    borderRadius: 0,
    '.MuiIconButton-root': {
      color: theme.palette.primary.contrastText,
    },
  },
  '.MuiDataGrid-row:nth-child(odd)': {
    background: theme.palette.background.default,
  },
  '.MuiDataGrid-row:nth-child(even)': {
    background: theme.palette.background.paper,
  },
  '.MuiDataGrid-columnSeparator': {
    color: 'transparent',
  },
  '.MuiDataGrid-cell:focus-within, & .MuiDataGrid-cell:focus': {
    outline: 'none',
  },
})) as typeof DataGrid;

interface Action<Item extends Identifiable, V = unknown> {
  name: string;
  render: (params: GridRenderCellParams<V, Item>) => ReactNode;
}

const actionDefaultProps: Partial<GridColDef> = {
  width: 30,
  resizable: false,
  headerName: '',
  sortable: false,
  filterable: false,
  hideable: false,
  disableColumnMenu: true,
};

type Formatters<Item extends {}> = {
  [K in keyof Item]?: (item: Item) => ReactNode;
};

interface TreeDataGridTable<Item extends Identifiable> extends Omit<DataGridProps<Item>, 'columns'> {
  rows: Item[];
  columns: ((keyof Item & string) | GridColDef<Item>)[];
  actions?: Action<Item>[];
  canDelete?: (item: Item) => boolean;
  disableDelete?: (item: Item) => boolean;
  onDelete?: (item: Item) => void;
  flex?: Record<keyof Item & string, number>;
  format?: Formatters<Item>;
  dependencies?: unknown[];
}

const alwaysTrue = () => true;

const alwaysFalse = () => false;

const getRowHeight = () => GUTTER_PX * 2;

const TreeDataGrid = <Item extends Identifiable>({
  rows,
  columns,
  format,
  actions,
  onDelete,
  flex,
  canDelete = alwaysTrue,
  disableDelete = alwaysFalse,
  dependencies = [],
  ...props
}: TreeDataGridTable<Item>) => {
  const { t } = useTranslation();

  const columnDefinitions = useMemo<GridColDef<Item>[]>(
    () =>
      columns.map(column => {
        const definition = (typeof column === 'string' ? { field: column } : column) as GridColDef<Item>;

        const formatter = format?.[definition.field] ?? ((item: Item) => item[definition.field]);

        return {
          headerName: t(`fields.${definition.field}` as TranslationKey) as string,
          renderHeader: ({ field }) => (
            <SwapColors>
              <CardText fontWeight="bold">{field}</CardText>
            </SwapColors>
          ),
          renderCell: ({ row }) => <CardText>{formatter(row)}</CardText>,
          resizable: true,
          flex: flex ? flex[definition.field] : 1,
          ...definition,
        };
      }),
    [t, ...dependencies]
  );

  const actionColumnDefinitions = useMemo<GridColDef<Item>[]>(() => {
    const actionDefinitions = [...(actions ?? [])];

    if (onDelete) {
      actionDefinitions.push({
        name: 'delete',
        render: ({ row }) =>
          canDelete(row) && (
            <IconButton onClick={() => onDelete(row)} disabled={disableDelete(row)}>
              <DeleteOutlineIcon color="warning" />
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
      headerHeight={getRowHeight()}
      getRowHeight={getRowHeight}
      autoHeight
      {...props}
    />
  );
};

export default TreeDataGrid;
