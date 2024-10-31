import { ContextSegment, ContextSegmentProps } from '../components/Common/ContextSegment';

export const SubspaceContextSegment = (props: SubspaceContextSegmentProps) => (
  <ContextSegment contextType="subspace" {...props} />
);

export interface SubspaceContextSegmentProps extends ContextSegmentProps {}
