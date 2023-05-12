import React, { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import CardFooterAvatar from './CardFooterAvatar';
import { Caption } from '../typography';
import { gutters } from '../grid/utils';

interface CardFooterBadgeProps {
  avatarUri?: string;
}

const CardFooterBadge = ({ avatarUri, children }: PropsWithChildren<CardFooterBadgeProps>) => {
  return (
    <Box display="flex" gap={gutters()} alignItems="center" height={gutters(2)}>
      {avatarUri && <CardFooterAvatar src={avatarUri} />}
      <Caption>{children}</Caption>
    </Box>
  );
};

export default CardFooterBadge;
