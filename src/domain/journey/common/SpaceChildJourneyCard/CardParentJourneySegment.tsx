import React, { ComponentType, PropsWithChildren } from 'react';
import CardSegmentCaption from '@core/ui/card/CardSegmentCaption';
import { SvgIconProps } from '@mui/material';
import RouterLink from '@core/ui/link/RouterLink';
import { LockOutlined } from '@mui/icons-material';

interface CardParentJourneySegmentProps {
  iconComponent?: ComponentType<SvgIconProps>;
  parentJourneyUri: string;
  locked?: boolean;
}

const CardParentJourneySegment = ({
  iconComponent: Icon,
  parentJourneyUri,
  locked,
  children,
}: PropsWithChildren<CardParentJourneySegmentProps>) => {
  const stopPropagation = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => event.stopPropagation();

  return (
    <CardSegmentCaption
      component={RouterLink}
      to={parentJourneyUri}
      icon={Icon ? <Icon fontSize="small" color="primary" /> : undefined}
      secondaryIcon={locked ? <LockOutlined fontSize="small" color="primary" /> : undefined}
      onClick={stopPropagation}
      disablePadding
    >
      {children}
    </CardSegmentCaption>
  );
};

export default CardParentJourneySegment;
