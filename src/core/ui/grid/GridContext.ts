import React, { useContext } from 'react';

export interface GridProperties {
  columns: number;
}

const GridContext = React.createContext<GridProperties | undefined>(undefined);

export default GridContext;

export const useColumns = () => {
  const gridProps = useContext(GridContext);

  if (!gridProps) {
    throw new Error('Not within a GridContainer.');
  }

  return gridProps.columns;
};
