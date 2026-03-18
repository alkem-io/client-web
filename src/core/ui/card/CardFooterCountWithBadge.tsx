import type { SvgIconComponent } from '@mui/icons-material';
import { Box, Tooltip } from '@mui/material';
import type { PropsWithChildren, ReactNode } from 'react';
import RoundedBadge from '../icon/RoundedBadge';
import RoundedIcon from '../icon/RoundedIcon';

type CardFooterBadgeProps = {
  tooltip?: string;
  icon?: ReactNode;
  iconComponent?: SvgIconComponent;
  count?: number;
};

const CardFooterCountWithBadge = ({ tooltip, icon, iconComponent, count }: PropsWithChildren<CardFooterBadgeProps>) => {
  return (
    <Tooltip title={`${count ? `${count} ` : ''}${tooltip}`}>
      <Box display="flex" gap={1} alignItems="center">
        {iconComponent ? (
          <RoundedIcon size="xsmall" component={iconComponent} />
        ) : (
          <RoundedBadge size="xsmall">{icon}</RoundedBadge>
        )}
      </Box>
    </Tooltip>
  );
};

export default CardFooterCountWithBadge;
