import React, { PropsWithChildren, useContext, useMemo } from 'react';
import GridContext, { GridProperties } from './GridContext';

interface GridProviderProps {
  columns: number | ((parentGridColumns: number | undefined) => number);
}

const GridProvider = ({ columns, children }: PropsWithChildren<GridProviderProps>) => {
  const parentGridColumns = useContext(GridContext);

  const gridProps: GridProperties = useMemo(() => {
    const nestedGridColumns = typeof columns === 'number' ? columns : columns(parentGridColumns?.columns);
    return { columns: nestedGridColumns };
  }, [columns, parentGridColumns]);

  return <GridContext.Provider value={gridProps}>{children}</GridContext.Provider>;
};

export default GridProvider;
