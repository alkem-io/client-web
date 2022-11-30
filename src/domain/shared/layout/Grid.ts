import { Theme } from '@mui/material/styles';

export const COLUMN_WIDTH = 9;
export const GUTTER = 3;

export const sxCols = (cols: number) => (theme: Theme) => getColsWidth(cols, theme);
export const getColsWidth = (cols: number, theme: Theme) => theme.spacing(COLUMN_WIDTH * cols + GUTTER * (cols - 1));
