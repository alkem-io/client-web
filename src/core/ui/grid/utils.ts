import { GUTTER_PX } from './constants';

export const getColumnsWidth = (itemColumns: number, gridColumns: number) => {
  const columns = Math.min(itemColumns, gridColumns);
  return `calc(((100% - ${GUTTER_PX}px * ${gridColumns - 1}) / ${gridColumns}) * ${columns} + ${GUTTER_PX}px * ${
    columns - 1
  })`;
};
