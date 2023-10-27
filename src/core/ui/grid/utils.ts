import { GUTTER_MUI, GUTTER_PX } from './constants';
import { Theme } from '@mui/material/styles';
import { useColumns } from './GridContext';

export const getColumnsWidth = (itemColumns: number, gridColumns: number) => {
  const columns = Math.min(itemColumns, gridColumns);
  return `calc(((100% - ${GUTTER_PX}px * ${gridColumns - 1}) / ${gridColumns}) * ${columns} + ${GUTTER_PX}px * ${
    columns - 1
  })`;
};

export const gutters =
  (num: number = 1) =>
  (theme: Theme) =>
    theme.spacing(GUTTER_MUI * num);

export interface GridItemStyle {
  width: string;
  flexGrow: 0;
  flexShrink: 0;
}

interface UseGridItemProvided {
  (columns?: number): GridItemStyle;
}

export const useGridItem = (): UseGridItemProvided => {
  const gridColumns = useColumns();

  return (columns?: number) => ({
    width: columns ? getColumnsWidth(columns, gridColumns) : '100%',
    flexGrow: 0,
    flexShrink: 0,
  });
};
