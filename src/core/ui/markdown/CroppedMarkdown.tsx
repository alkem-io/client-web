import WrapperMarkdown, { MarkdownProps } from './WrapperMarkdown';
import { gutters } from '../grid/utils';
import OverflowGradient, { OverflowGradientProps } from '../overflow/OverflowGradient';
import { DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS } from '../card/CardDescription';

interface CroppedMarkdownProps extends MarkdownProps {
  children: string;
  backgroundColor?: OverflowGradientProps['backgroundColor'];
  maxHeightGutters?: number;
  minHeightGutters?: number;
}

const CroppedMarkdown = ({
  children,
  maxHeightGutters = DEFAULT_CARDDESCRIPTION_HEIGHT_GUTTERS,
  minHeightGutters = 0,
  backgroundColor = 'default',
  ...props
}: CroppedMarkdownProps) => (
  <OverflowGradient
    maxHeight={gutters(maxHeightGutters)}
    minHeight={gutters(minHeightGutters)}
    backgroundColor={backgroundColor}
  >
    <WrapperMarkdown card {...props}>
      {children}
    </WrapperMarkdown>
  </OverflowGradient>
);

export default CroppedMarkdown;
