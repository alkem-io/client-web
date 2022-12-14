import React, { PropsWithChildren } from 'react';
import { Paper } from '@mui/material';

import withElevationOnHover from '../../../domain/shared/components/withElevationOnHover';
import { useGridItem } from '../grid/utils';

const ElevatedPaper = withElevationOnHover(Paper);

export interface ContributeCardContainerProps {
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const CONTRIBUTE_CARD_COLUMNS = 3;

const ContributeCard = ({ onClick, children }: PropsWithChildren<ContributeCardContainerProps>) => {
  const getGridItemStyle = useGridItem();

  return (
    <ElevatedPaper
      sx={{
        background: theme => theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        cursor: onClick ? 'pointer' : 'default',
        ...getGridItemStyle(CONTRIBUTE_CARD_COLUMNS),
      }}
      onClick={onClick}
      elevationDisabled={!onClick}
    >
      {children}
    </ElevatedPaper>
  );
};

export default ContributeCard;
