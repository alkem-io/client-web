import React, { PropsWithChildren } from 'react';
import { Paper } from '@mui/material';

import withElevationOnHover from '../../../shared/components/withElevationOnHover';

const ElevatedPaper = withElevationOnHover(Paper);

const ContributeCardContainer = ({ onClick, children }: PropsWithChildren<{ onClick?: (e: MouseEvent) => void }>) => {
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

const ContributeCard = (props: ContributeCardProps) => {
  const { titleComponent, contentComponent, extraInfoComponent, onClick } = props;
  return (
    <ContributeCardContainer onClick={onClick}>
      {titleComponent ? <>{titleComponent}</> : null}
      {contentComponent ? <>{contentComponent}</> : null}
      {extraInfoComponent ? <>{extraInfoComponent}</> : null}
    </ContributeCardContainer>
  );
};

export default ContributeCard;
