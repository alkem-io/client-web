import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { ActivitySubject } from '../types/ActivitySubject';
import { ActivityEventType } from '../../../../../core/apollo/generated/graphql-schema';
import ActivitySubjectMarkdown from './ActivitySubjectMarkdown';

interface ActivityCalloutPostCommentCreatedViewProps extends ActivityViewProps {
  post: ActivitySubject;
  description: string;
  type: ActivityEventType.CalloutPostComment;
}

export const ActivityCalloutPostCommentCreatedView: FC<ActivityCalloutPostCommentCreatedViewProps> = ({
  displayName,
  avatarUrl,
  loading,
  createdDate,
  post,
  description,
  type,
  footerComponent,
}) => {
  return (
    <ActivityBaseView
      displayName={displayName}
      avatarUrl={avatarUrl}
      loading={loading}
      type={type}
      title={<ActivitySubjectMarkdown>{description}</ActivitySubjectMarkdown>}
      url={post.profile.url}
      footerComponent={footerComponent}
      contextDisplayName={post.profile.displayName}
      createdDate={createdDate}
    />
  );
};
