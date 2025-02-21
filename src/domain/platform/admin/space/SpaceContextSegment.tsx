import { FC } from 'react';
import { ContextSegment, ContextSegmentProps } from '../components/Common/ContextSegment';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

export interface SpaceContextSegmentProps extends ContextSegmentProps {}

export const SpaceContextSegment: FC<SpaceContextSegmentProps> = ({ ...props }) => {
  return <ContextSegment spaceLevel={SpaceLevel.L0} {...props} />;
};
