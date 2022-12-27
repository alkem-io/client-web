import React from 'react';
import WrapperMarkdown from '../../../../common/components/core/WrapperMarkdown';
import OverflowGradient from '../../../../core/ui/overflow/OverflowGradient';
import { gutters } from '../../../../core/ui/grid/utils';

interface JourneyCardVisionProps {
  children: string;
}

const JourneyCardVision = ({ children }: JourneyCardVisionProps) => {
  return (
    <OverflowGradient maxHeight={gutters(6)}>
      <WrapperMarkdown card>{children}</WrapperMarkdown>
    </OverflowGradient>
  );
};

export default JourneyCardVision;
