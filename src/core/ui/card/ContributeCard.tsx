import React, { PropsWithChildren } from 'react';
import { Paper } from '@mui/material';

import withElevationOnHover from '../../../domain/shared/components/withElevationOnHover';

const ElevatedPaper = withElevationOnHover(Paper);

export interface ContributeCardContainerProps {
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const ContributeCard = ({ onClick, children }: PropsWithChildren<ContributeCardContainerProps>) => {
  return (
    <ElevatedPaper
      sx={{
        background: theme => theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        cursor: onClick ? 'pointer' : 'default',
        width: 230, // TODO use GridItem when placed within a <PageContentBlock cards> instead of manually setting width
      }}
      onClick={onClick}
    >
      {children}
    </ElevatedPaper>
  );
};

export default ContributeCard;
