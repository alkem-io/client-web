import { GUTTER_MUI, GUTTER_PX } from './constants';
import { Theme } from '@mui/material/styles';

export const getColumnsWidth = (itemColumns: number, gridColumns: number) => {
  const columns = Math.min(itemColumns, gridColumns);
  return `calc(((100% - ${GUTTER_PX}px * ${gridColumns - 1}) / ${gridColumns}) * ${columns} + ${GUTTER_PX}px * ${
    columns - 1
  })`;
};

export const gutters = (num: number) => (theme: Theme) => theme.spacing(GUTTER_MUI * num);
