import { Card, CardProps } from '@mui/material';
import React, { FC } from 'react';
import ConditionalLink from '../ConditionalLink';
import withElevationOnHover from '../../../domain/shared/components/withElevationOnHover';

interface LinkCardProps extends CardProps {
  to?: string;
  elevationDisabled?: boolean;
  keepScroll?: boolean;
}

const ElevatedCard = withElevationOnHover(Card);

const LinkCard: FC<LinkCardProps> = ({ to, elevationDisabled = false, keepScroll, ...rest }) => {
  return (
    <ConditionalLink condition={!!to} to={to} keepScroll={keepScroll}>
      <ElevatedCard {...rest} elevationDisabled={elevationDisabled} />
    </ConditionalLink>
  );
};

export default LinkCard;
