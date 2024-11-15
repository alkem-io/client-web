import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { ActivitySubject } from '../types/ActivitySubject';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
import ActivitySubjectMarkdown from './ActivitySubjectMarkdown';

interface ActivityCalloutPostCommentCreatedViewProps extends ActivityViewProps {
  post: ActivitySubject;
  description: string;
  type: ActivityEventType.CalloutPostComment;
}

export const ActivityCalloutPostCommentCreatedView: FC<ActivityCalloutPostCommentCreatedViewProps> = ({
  post,
  description,
  type,
  ...rest
}) => {
  return (
    <ActivityBaseView
      type={type}
      title={<ActivitySubjectMarkdown>{description}</ActivitySubjectMarkdown>}
      url={post.profile.url}
      contextDisplayName={post.profile.displayName}
      {...rest}
    />
  );
};
