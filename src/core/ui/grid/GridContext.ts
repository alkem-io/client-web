import React, { useContext } from 'react';

export interface GridProperties {
  columnsAvailable: number;
  columnsDeclared: number;
}

const GridContext = React.createContext<GridProperties | undefined>(undefined);

export default GridContext;

export const useColumns = () => {
  const gridProps = useContext(GridContext);

  if (!gridProps) {
    throw new Error('Not within a GridContainer.');
  }

  return gridProps.columnsAvailable;
};

export const useDeclaredColumns = () => {
  const gridProps = useContext(GridContext);

  if (!gridProps) {
    throw new Error('Not within a GridContainer.');
  }

  return gridProps.columnsDeclared;
};
