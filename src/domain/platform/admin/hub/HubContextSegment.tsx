import { FC } from 'react';
import { ContextSegment, ContextSegmentProps } from '../components/Common/ContextSegment';

export interface HubContextSegmentProps extends ContextSegmentProps {}

export const HubContextSegment: FC<HubContextSegmentProps> = ({ ...props }) => {
  return <ContextSegment contextType="hub" {...props} />;
};
