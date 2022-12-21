import React, { ReactNode } from 'react';
import webkitLineClamp from '../../../../core/ui/utils/webkitLineClamp';
import { CardText } from '../../../../core/ui/typography';

interface JourneyCardVisionProps {
  children: Exclude<ReactNode, boolean | null | undefined>;
}

const JourneyCardVision = ({ children }: JourneyCardVisionProps) => {
  return <CardText sx={webkitLineClamp(6)}>{children}</CardText>;
};

export default JourneyCardVision;
