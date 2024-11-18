import { PropsWithChildren, ReactNode } from 'react';
import { Box, Tooltip } from '@mui/material';
import { Caption } from '../typography';
import RoundedBadge from '../icon/RoundedBadge';
import { SvgIconComponent } from '@mui/icons-material';
import RoundedIcon from '../icon/RoundedIcon';

type CardFooterBadgeProps = {
  tooltip?: string;
  icon?: ReactNode;
  iconComponent?: SvgIconComponent;
};

const CardFooterCountWithBadge = ({
  tooltip,
  icon,
  iconComponent,
  children,
}: PropsWithChildren<CardFooterBadgeProps>) => {
  return (
    <Tooltip title={tooltip}>
      <Box display="flex" gap={1} alignItems="center">
        {iconComponent ? (
          <RoundedIcon size="xsmall" component={iconComponent} />
        ) : (
          <RoundedBadge size="xsmall">{icon}</RoundedBadge>
        )}
        <Caption>{children}</Caption>
      </Box>
    </Tooltip>
  );
};

export default CardFooterCountWithBadge;
