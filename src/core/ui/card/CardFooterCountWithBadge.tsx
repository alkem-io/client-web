import React, { PropsWithChildren, ReactNode } from 'react';
import { Box } from '@mui/material';
import { Caption } from '../typography';
import RoundedBadge from '../icon/RoundedBadge';
import { SvgIconComponent } from '@mui/icons-material';
import RoundedIcon from '../icon/RoundedIcon';

interface CardFooterBadgeProps {
  icon?: ReactNode;
  iconComponent?: SvgIconComponent;
}

const CardFooterCountWithBadge = ({ icon, iconComponent, children }: PropsWithChildren<CardFooterBadgeProps>) => {
  return (
    <Box display="flex" gap={1} alignItems="center">
      {iconComponent ? (
        <RoundedIcon size="xsmall" component={iconComponent} />
      ) : (
        <RoundedBadge size="xsmall">{icon}</RoundedBadge>
      )}
      <Caption>{children}</Caption>
    </Box>
  );
};

export default CardFooterCountWithBadge;
