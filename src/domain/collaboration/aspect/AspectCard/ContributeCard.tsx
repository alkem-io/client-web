import React, { PropsWithChildren } from 'react';
import { Paper } from '@mui/material';

import withElevationOnHover from '../../../shared/components/withElevationOnHover';

const ElevatedPaper = withElevationOnHover(Paper);

export interface ContributeCardContainerProps {
  onClick?: (e: MouseEvent) => void;
}

const ContributeCardContainer = ({ onClick, children }: PropsWithChildren<ContributeCardContainerProps>) => {
  return (
    <ElevatedPaper
      sx={{
        background: theme => theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={e => (onClick ? onClick(e as any) : null)}
    >
      {children}
    </ElevatedPaper>
  );
};

export interface ContributeCardProps {
  titleComponent?: React.ReactNode;
  contentComponent?: React.ReactNode;
  extraInfoComponent?: React.ReactNode;
  onClick?: (e: MouseEvent) => void;
}

const ContributeCard = ({ children, onClick }: PropsWithChildren<ContributeCardProps>) => {
  return <ContributeCardContainer onClick={onClick}>{children}</ContributeCardContainer>;
};

export default ContributeCard;
