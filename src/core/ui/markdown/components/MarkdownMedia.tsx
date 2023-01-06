import React, { ElementType, useContext } from 'react';
import { ReactMarkdownProps } from 'react-markdown/lib/complex-types';
import { Box } from '@mui/material';
import GridContext from '../../grid/GridContext';
import { getColumnsWidth } from '../../grid/utils';

const getColumns = (gridColumns: number) => {
  if (gridColumns >= 12) {
    return 8;
  }
  if (gridColumns <= 8) {
    return gridColumns;
  }
  return Math.round(gridColumns * 0.75);
};

const MarkdownMedia = ({ node, ...props }: ReactMarkdownProps) => {
  const { columnsAvailable } = useContext(GridContext) ?? { columnsAvailable: 12 };
  const itemColumns = getColumns(columnsAvailable);
  const maxWidth = getColumnsWidth(itemColumns, columnsAvailable);

  return <Box component={node.tagName as ElementType} maxWidth={maxWidth} {...props} />;
};

export default MarkdownMedia;
