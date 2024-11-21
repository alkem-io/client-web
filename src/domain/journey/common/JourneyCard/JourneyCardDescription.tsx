import React from 'react';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import OverflowGradient from '@/core/ui/overflow/OverflowGradient';
import { gutters } from '@/core/ui/grid/utils';
import stopPropagationFromLinks from '@/core/ui/utils/stopPropagationFromLinks';

interface JourneyCardDescriptionProps {
  rows?: number;
  children: string;
}

const JourneyCardDescription = ({ rows = 6, children }: JourneyCardDescriptionProps) => {
  return (
    <OverflowGradient maxHeight={gutters(rows)} onClick={stopPropagationFromLinks}>
      <WrapperMarkdown card>{children}</WrapperMarkdown>
    </OverflowGradient>
  );
};

export default JourneyCardDescription;
