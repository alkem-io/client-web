import { cloneElement, ReactElement } from 'react';
import { SxProps } from '@mui/material';
import { GridItemStyle, useGridItem } from './utils';

export interface GridItemProps {
  columns?: number;
}

interface GridItemPropsWithChildElement<ChildProps extends { sx?: SxProps }> extends GridItemProps {
  children?: ReactElement<ChildProps> | ((props: GridItemStyle) => ReactElement);
}

/**
 * Use to make an element take horizontal space according to the grid.
 * This does not create an extra HTML element that wraps the underlying one.
 * @param columns - the number of columns the element takes
 * @param children - the element which size should be set
 * @constructor
 */
const GridItem = <ChildProps extends { sx?: SxProps }>({
  columns,
  children,
}: GridItemPropsWithChildElement<ChildProps>) => {
  const getGridItemStyle = useGridItem();

  if (!children) {
    return null;
  }

  if (typeof children === 'function') {
    return children(getGridItemStyle(columns));
  }

  const { sx } = children.props;

  const mergedSx = {
    ...getGridItemStyle(columns),
    ...sx,
  };

  return cloneElement(children, { sx: mergedSx } as ChildProps);
};

export default GridItem;
