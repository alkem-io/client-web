import { FC } from 'react';
import { ContextSegment, ContextSegmentProps } from '../components/Common/ContextSegment';

export interface ChallengeContextSegmentProps extends ContextSegmentProps {}

export const ChallengeContextSegment: FC<ChallengeContextSegmentProps> = ({ ...props }) => {
  return <ContextSegment contextType="challenge" {...props} />;
};
