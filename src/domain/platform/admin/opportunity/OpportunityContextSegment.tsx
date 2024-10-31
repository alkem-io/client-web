import { ContextSegment, ContextSegmentProps } from '../components/Common/ContextSegment';

export const OpportunityContextSegment = (props: OpportunityContextSegmentProps) => (
  <ContextSegment contextType="subsubspace" {...props} />
);

export interface OpportunityContextSegmentProps extends ContextSegmentProps {}
