import React, { ReactNode } from 'react';
import webkitLineClamp from '@core/ui/utils/webkitLineClamp';
import { CardText } from '@core/ui/typography';

interface JourneyCardTaglineProps {
  children: Exclude<ReactNode, boolean | null | undefined>;
}

const JourneyCardTagline = ({ children }: JourneyCardTaglineProps) => {
  return <CardText sx={webkitLineClamp(3, { keepMinHeight: true })}>{children}</CardText>;
};

export default JourneyCardTagline;
