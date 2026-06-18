import { useColumns } from './GridContext';
import { GUTTER_MUI, GUTTER_PX } from './gutter.constants';

/**
 * Minimal structural shape of the theme `gutters` needs — just the spacing
 * function. MUI-free replacement for the previous MUI Material styles `Theme`
 * import; any MUI theme passed by remaining MUI callers still satisfies it.
 */
type ThemeWithSpacing = { spacing: (value: number) => string | number };

export const getColumnsWidth = (itemColumns: number, gridColumns: number) => {
  const columns = Math.min(itemColumns, gridColumns);
  return `calc(((100% - ${GUTTER_PX}px * ${gridColumns - 1}) / ${gridColumns}) * ${columns} + ${GUTTER_PX}px * ${
    columns - 1
  })`;
};

export const gutters =
  (num: number = 1) =>
  (theme: ThemeWithSpacing) =>
    theme.spacing(GUTTER_MUI * num);

export interface GridItemStyle {
  width: string;
  flexGrow: 0;
  flexShrink: 0;
}

type UseGridItemProvided = (columns?: number) => GridItemStyle;

export const useGridItem = (): UseGridItemProvided => {
  const gridColumns = useColumns();

  return (columns?: number) => ({
    width: columns ? getColumnsWidth(columns, gridColumns) : '100%',
    flexGrow: 0,
    flexShrink: 0,
  });
};
