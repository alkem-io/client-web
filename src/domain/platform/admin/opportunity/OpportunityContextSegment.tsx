import { FC } from 'react';
import { ContextSegment, ContextSegmentProps } from '../components/Common/ContextSegment';

export interface OpportunityContextSegmentProps extends ContextSegmentProps {}

export const OpportunityContextSegment: FC<OpportunityContextSegmentProps> = ({ ...props }) => {
  return <ContextSegment spaceLevel="subsubspace" {...props} />;
};
