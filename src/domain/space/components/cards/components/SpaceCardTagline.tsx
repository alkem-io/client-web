import React, { ReactNode } from 'react';
import webkitLineClamp from '@/core/ui/utils/webkitLineClamp';
import { CardText } from '@/core/ui/typography';

interface SpaceCardTaglineProps {
  children: Exclude<ReactNode, boolean | null | undefined>;
}

const SpaceCardTagline = ({ children }: SpaceCardTaglineProps) => {
  return (
    <CardText
      sx={{
        ...webkitLineClamp(2, { keepMinHeight: true }),
        color: theme => theme.palette.neutral.light,
      }}
    >
      {children}
    </CardText>
  );
};

export default SpaceCardTagline;
