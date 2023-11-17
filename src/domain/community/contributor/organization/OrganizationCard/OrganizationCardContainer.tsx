import React, { MouseEventHandler, PropsWithChildren } from 'react';
import { Paper } from '@mui/material';
import withElevationOnHover from '../../../../shared/components/withElevationOnHover';
import ButtonBaseAlignReset from '../../../../../core/ui/button/ButtonBaseAlignReset';

const ElevatedPaper = withElevationOnHover(Paper);

export interface OrganizationCardContainerProps {
  onClick?: MouseEventHandler;
}

const OrganizationCardContainer = ({ onClick, children }: PropsWithChildren<OrganizationCardContainerProps>) => {
  return (
    <ElevatedPaper
      // MUI generics are difficult to inherit from while preserving the original types
      // @ts-ignore
      component={onClick ? ButtonBaseAlignReset : Paper}
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
