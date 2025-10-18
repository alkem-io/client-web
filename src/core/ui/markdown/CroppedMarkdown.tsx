import WrapperMarkdown, { WrapperMarkdownProps } from './WrapperMarkdown';
import { gutters } from '../grid/utils';
import OverflowGradient, { OverflowGradientProps } from '../overflow/OverflowGradient';
import AutomaticOverflowGradient from '../overflow/AutomaticOverflowGradient';
import { DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS } from '../card/CardDescription';

interface CroppedMarkdownProps extends WrapperMarkdownProps {
  children: string;
  backgroundColor?: OverflowGradientProps['backgroundColor'];
  overflowMarker?: OverflowGradientProps['overflowMarker'];
  maxHeightGutters?: number;
  minHeightGutters?: number;

  /**
   * Experimental, works for ReferenceView and might replace OverflowGradient in the future, but for now it is opt-in
   */
  automaticOverflowDetector?: boolean;
}

const CroppedMarkdown = ({
  children,
  maxHeightGutters = DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS,
  minHeightGutters = 0,
  backgroundColor = 'default',
  overflowMarker,
  automaticOverflowDetector,
  ...props
}: CroppedMarkdownProps) => {
  const OverflowGradientComponent = automaticOverflowDetector ? AutomaticOverflowGradient : OverflowGradient;

  return (
    <OverflowGradientComponent
      maxHeight={gutters(maxHeightGutters)}
      minHeight={gutters(minHeightGutters)}
      backgroundColor={backgroundColor}
      overflowMarker={overflowMarker}
    >
      <WrapperMarkdown card {...props}>
        {children}
      </WrapperMarkdown>
    </OverflowGradientComponent>
  );
};

export default CroppedMarkdown;
