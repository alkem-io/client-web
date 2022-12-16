import React, { PropsWithChildren } from 'react';
import { Paper } from '@mui/material';
import withElevationOnHover from '../../../domain/shared/components/withElevationOnHover';
import GridItem from '../grid/GridItem';

const ElevatedPaper = withElevationOnHover(Paper);

export interface ContributeCardContainerProps {
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const CONTRIBUTE_CARD_COLUMNS = 3;

const ContributeCard = ({ onClick, children }: PropsWithChildren<ContributeCardContainerProps>) => {
  return (
    <GridItem columns={CONTRIBUTE_CARD_COLUMNS}>
      <ElevatedPaper
        sx={{
          background: theme => theme.palette.background.paper,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          cursor: onClick ? 'pointer' : 'default',
        }}
        onClick={onClick}
      >
        {children}
      </ElevatedPaper>
    </GridItem>
  );
};

export default ContributeCard;
