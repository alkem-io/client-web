import { FC } from 'react';
import { ContextSegment, ContextSegmentProps } from '../components/Common/ContextSegment';
import React from 'react';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

export interface SubspaceContextSegmentProps extends ContextSegmentProps {}

export const SubspaceAboutSegment: FC<SubspaceContextSegmentProps> = ({ ...props }) => {
  return <ContextSegment spaceLevel={SpaceLevel.L1} {...props} />;
};
