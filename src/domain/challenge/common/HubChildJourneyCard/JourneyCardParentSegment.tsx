import React, { ComponentType, PropsWithChildren } from 'react';
import CardSegmentCaption from '../../../../core/ui/card/CardSegmentCaption';
import { Caption } from '../../../../core/ui/typography';
import { SvgIconProps } from '@mui/material';
import RouterLink from '../../../../core/ui/link/RouterLink';
import { LockOutlined } from '@mui/icons-material';

interface JourneyCardParentSegmentProps {
  iconComponent?: ComponentType<SvgIconProps>;
  parentJourneyUri: string;
  locked?: boolean;
}

const JourneyCardParentSegment = ({
  iconComponent: Icon,
  parentJourneyUri,
  locked,
  children,
}: PropsWithChildren<JourneyCardParentSegmentProps>) => {
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
      <Caption noWrap>{children}</Caption>
    </CardSegmentCaption>
  );
};

export default JourneyCardParentSegment;
