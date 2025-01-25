import { FC } from 'react';
import { ContextSegment, ContextSegmentProps } from '../components/Common/ContextSegment';

export interface SpaceContextSegmentProps extends ContextSegmentProps {}

export const SpaceContextSegment: FC<SpaceContextSegmentProps> = ({ ...props }) => {
  return <ContextSegment spaceLevel="space" {...props} />;
};
