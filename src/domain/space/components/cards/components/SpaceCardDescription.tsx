import { gutters } from '@/core/ui/grid/utils';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import OverflowGradient from '@/core/ui/overflow/OverflowGradient';
import stopPropagationFromLinks from '@/core/ui/utils/stopPropagationFromLinks';

interface SpaceCardDescriptionProps {
  rows?: number;
  children: string;
}

const SpaceCardDescription = ({ rows = 6, children }: SpaceCardDescriptionProps) => {
  return (
    <OverflowGradient maxHeight={gutters(rows)} onClick={stopPropagationFromLinks}>
      <WrapperMarkdown card={true}>{children}</WrapperMarkdown>
    </OverflowGradient>
  );
};

export default SpaceCardDescription;
