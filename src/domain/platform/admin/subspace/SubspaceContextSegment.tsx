import { FC } from 'react';
import { ContextSegment, ContextSegmentProps } from '../components/Common/ContextSegment';
import React from 'react';

export interface SubspaceContextSegmentProps extends ContextSegmentProps {}

export const SubspaceContextSegment: FC<SubspaceContextSegmentProps> = ({ ...props }) => {
  return <ContextSegment contextType="subspace" {...props} />;
};
