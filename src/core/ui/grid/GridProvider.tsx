import { type PropsWithChildren, useContext } from 'react';
import GridContext, { type GridProperties } from './GridContext';

type GridProviderProps = {
  columns: number;
  force?: boolean;
};

const GridProvider = ({ columns, force = false, children }: PropsWithChildren<GridProviderProps>) => {
  const parentGridContext = useContext(GridContext);

  const gridProps: GridProperties = {
    columnsAvailable: parentGridContext && !force ? Math.min(columns, parentGridContext.columnsAvailable) : columns,
    columnsDeclared: columns,
  };

  return <GridContext value={gridProps}>{children}</GridContext>;
};

export default GridProvider;
