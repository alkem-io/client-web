import React, { PropsWithChildren } from 'react';
import { Box } from '@mui/material';
import CardFooterAvatar from './CardFooterAvatar';
import { Caption } from '../typography';

interface CardFooterBadgeProps {
  avatarUri?: string;
}

const CardFooterBadge = ({ avatarUri, children }: PropsWithChildren<CardFooterBadgeProps>) => {
  return (
    <Box display="flex" gap={1} alignItems="center">
      {avatarUri && <CardFooterAvatar src={avatarUri} />}
      <Caption>{children}</Caption>
    </Box>
  );
};

export default CardFooterBadge;
