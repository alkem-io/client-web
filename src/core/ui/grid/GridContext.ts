import React, { useContext } from 'react';

const BREAKPOINT_MOBILE_COLUMNS_XS = 6;
const BREAKPOINT_MOBILE_COLUMNS_XS_SM = 8;
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

export const useScreenLayoutXsDetected = () => {
  const gridProps = useContext(GridContext);

  if (!gridProps) {
    throw new Error('Not within a GridContainer.');
  }
  if (gridProps.columnsAvailable > BREAKPOINT_MOBILE_COLUMNS_XS) {
    return false;
  }

  return true;
};

export const useScreenLayoutXsSmDetected = () => {
  const gridProps = useContext(GridContext);

  if (!gridProps) {
    throw new Error('Not within a GridContainer.');
  }
  if (gridProps.columnsAvailable > BREAKPOINT_MOBILE_COLUMNS_XS_SM) {
    return false;
  }

  return true;
};

export const useDeclaredColumns = () => {
  const gridProps = useContext(GridContext);

  if (!gridProps) {
    throw new Error('Not within a GridContainer.');
  }

  return gridProps.columnsDeclared;
};
