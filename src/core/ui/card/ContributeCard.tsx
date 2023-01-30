import React, { PropsWithChildren } from 'react';
import { Paper, SxProps } from '@mui/material';
import { Theme } from '@mui/material/styles';
import withElevationOnHover from '../../../domain/shared/components/withElevationOnHover';
import GridItem from '../grid/GridItem';

const ElevatedPaper = withElevationOnHover(Paper);

export interface ContributeCardContainerProps {
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
  sx?: SxProps<Theme>;
  columns?: number;
}

const CONTRIBUTE_CARD_COLUMNS = 3;

const ContributeCard = ({
  columns = CONTRIBUTE_CARD_COLUMNS,
  onClick,
  sx,
  children,
}: PropsWithChildren<ContributeCardContainerProps>) => {
  return (
    <GridItem columns={columns}>
      <ElevatedPaper
        sx={{
          background: theme => theme.palette.background.paper,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          cursor: onClick ? 'pointer' : 'default',
          ...sx,
        }}
        onClick={onClick}
      >
        {children}
      </ElevatedPaper>
    </GridItem>
  );
};

export default ContributeCard;
