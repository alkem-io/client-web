import React from 'react';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import OverflowGradient from '@/core/ui/overflow/OverflowGradient';
import { gutters } from '@/core/ui/grid/utils';
import stopPropagationFromLinks from '@/core/ui/utils/stopPropagationFromLinks';

interface SpaceCardDescriptionProps {
  rows?: number;
  children: string;
}

const SpaceCardDescription = ({ rows = 6, children }: SpaceCardDescriptionProps) => {
  return (
    <OverflowGradient maxHeight={gutters(rows)} onClick={stopPropagationFromLinks}>
      <WrapperMarkdown card>{children}</WrapperMarkdown>
    </OverflowGradient>
  );
};

export default SpaceCardDescription;
