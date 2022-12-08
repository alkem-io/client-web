import React, { PropsWithChildren, useMemo } from 'react';
import GridContext, { GridProperties } from './GridContext';

const GridProvider = ({ columns, children }: PropsWithChildren<GridProperties>) => {
  const gridProps: GridProperties = useMemo(() => ({ columns }), [columns]);

  return <GridContext.Provider value={gridProps}>{children}</GridContext.Provider>;
};

export default GridProvider;
