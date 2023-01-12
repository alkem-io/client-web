import React from 'react';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import OverflowGradient from '../../../../core/ui/overflow/OverflowGradient';
import { gutters } from '../../../../core/ui/grid/utils';
import stopPropagationFromLinks from '../../../../core/ui/utils/stopPropagationFromLinks';

interface JourneyCardVisionProps {
  children: string;
}

const JourneyCardVision = ({ children }: JourneyCardVisionProps) => {
  return (
    <OverflowGradient maxHeight={gutters(6)} onClick={stopPropagationFromLinks}>
      <WrapperMarkdown card>{children}</WrapperMarkdown>
    </OverflowGradient>
  );
};

export default JourneyCardVision;
