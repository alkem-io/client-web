import { PropsWithChildren, useContext, useMemo } from 'react';
import GridContext, { GridProperties } from './GridContext';

type GridProviderProps = {
  columns: number;
  force?: boolean;
};

const GridProvider = ({ columns, force = false, children }: PropsWithChildren<GridProviderProps>) => {
  const parentGridContext = useContext(GridContext);

  const gridProps: GridProperties = useMemo(() => {
    return {
      columnsAvailable: parentGridContext && !force ? Math.min(columns, parentGridContext.columnsAvailable) : columns,
      columnsDeclared: columns,
    };
  }, [columns, force, parentGridContext]);

  return <GridContext value={gridProps}>{children}</GridContext>;
};

export default GridProvider;
