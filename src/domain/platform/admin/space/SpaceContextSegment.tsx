import { ContextSegment, ContextSegmentProps } from '../components/Common/ContextSegment';

export const SpaceContextSegment = (props: SpaceContextSegmentProps) => (
  <ContextSegment contextType="space" {...props} />
);

export interface SpaceContextSegmentProps extends ContextSegmentProps {}
