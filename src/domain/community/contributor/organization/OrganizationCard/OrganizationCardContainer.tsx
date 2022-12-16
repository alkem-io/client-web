import React, { PropsWithChildren } from 'react';
import { Paper } from '@mui/material';
import withElevationOnHover from '../../../../shared/components/withElevationOnHover';

const ElevatedPaper = withElevationOnHover(Paper);

export interface OrganizationCardContainerProps {
  onClick?: (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => void;
}

const OrganizationCardContainer = ({ onClick, children }: PropsWithChildren<OrganizationCardContainerProps>) => {
  return (
    <ElevatedPaper
      sx={{
        background: theme => theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        cursor: onClick ? 'pointer' : 'default',
      }}
      onClick={onClick}
      elevationDisabled={!onClick}
    >
      {children}
    </ElevatedPaper>
  );
};

export default OrganizationCardContainer;
