import React, { ComponentType, PropsWithChildren } from 'react';
import CardSegmentCaption from '../../../../core/ui/card/CardSegmentCaption';
import { Caption } from '../../../../core/ui/typography';
import { SvgIconProps } from '@mui/material';
import RouterLink from '../../../../core/ui/link/RouterLink';

interface JourneyCardParentSegmentProps {
  iconComponent: ComponentType<SvgIconProps>;
  parentJourneyUri: string;
}

const JourneyCardParentSegment = ({
  iconComponent: Icon,
  parentJourneyUri,
  children,
}: PropsWithChildren<JourneyCardParentSegmentProps>) => {
  const stopPropagation = (event: React.MouseEvent<HTMLDivElement, MouseEvent>) => event.stopPropagation();

  return (
    <CardSegmentCaption
      component={RouterLink}
      to={parentJourneyUri}
      icon={<Icon fontSize="small" color="primary" />}
      align="left"
      onClick={stopPropagation}
    >
      <Caption noWrap>{children}</Caption>
    </CardSegmentCaption>
  );
};

export default JourneyCardParentSegment;
