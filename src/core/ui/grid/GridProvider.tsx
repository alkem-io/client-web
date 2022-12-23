import React, { PropsWithChildren, useContext, useMemo } from 'react';
import GridContext, { GridProperties } from './GridContext';

interface GridProviderProps {
  columns: number;
}

const GridProvider = ({ columns, children }: PropsWithChildren<GridProviderProps>) => {
  const parentGridContext = useContext(GridContext);

  const gridProps: GridProperties = useMemo(() => {
    return {
      columnsAvailable: parentGridContext ? Math.min(columns, parentGridContext.columnsAvailable) : columns,
      columnsDeclared: columns,
    };
  }, [columns, parentGridContext]);

  return <GridContext.Provider value={gridProps}>{children}</GridContext.Provider>;
};

export default GridProvider;
