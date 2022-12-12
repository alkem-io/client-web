import React, { PropsWithChildren, useContext, useMemo } from 'react';
import GridContext, { GridProperties } from './GridContext';

interface GridProviderProps {
  columns: number | ((parentGridColumns: number | undefined) => number);
}

const GridProvider = ({ columns, children }: PropsWithChildren<GridProviderProps>) => {
  const parentGridContext = useContext(GridContext);

  const gridProps: GridProperties = useMemo(() => {
    const nestedGridColumns = typeof columns === 'number' ? columns : columns(parentGridContext?.columns);
    return { columns: nestedGridColumns };
  }, [columns, parentGridContext]);

  return <GridContext.Provider value={gridProps}>{children}</GridContext.Provider>;
};

export default GridProvider;
