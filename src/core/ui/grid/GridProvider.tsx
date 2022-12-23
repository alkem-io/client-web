import React, { PropsWithChildren, useContext, useMemo } from 'react';
import GridContext, { GridProperties } from './GridContext';

interface GridProviderProps {
  columns: number;
  force?: boolean;
}

const GridProvider = ({ columns, force = false, children }: PropsWithChildren<GridProviderProps>) => {
  const parentGridContext = useContext(GridContext);

  const gridProps: GridProperties = useMemo(() => {
    return {
      columnsAvailable: parentGridContext && !force ? Math.min(columns, parentGridContext.columnsAvailable) : columns,
      columnsDeclared: columns,
    };
  }, [columns, force, parentGridContext]);

  return <GridContext.Provider value={gridProps}>{children}</GridContext.Provider>;
};

export default GridProvider;
