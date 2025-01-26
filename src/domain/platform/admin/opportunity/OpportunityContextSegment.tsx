import { FC } from 'react';
import { ContextSegment, ContextSegmentProps } from '../components/Common/ContextSegment';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

export interface OpportunityContextSegmentProps extends ContextSegmentProps {}

export const OpportunityContextSegment: FC<OpportunityContextSegmentProps> = ({ ...props }) => {
  return <ContextSegment spaceLevel={SpaceLevel.L2} {...props} />;
};
