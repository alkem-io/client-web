import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { ActivityCalloutValues } from '../../../../shared/types/ActivityCalloutValues';
import { ActivityEventType } from '../../../../../core/apollo/generated/graphql-schema';
import ActivitySubjectMarkdown from './ActivitySubjectMarkdown';

interface ActivityDiscussionCommentCreatedViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues;
  description: string;
  type: ActivityEventType.DiscussionComment;
}

export const ActivityDiscussionCommentCreatedView: FC<ActivityDiscussionCommentCreatedViewProps> = ({
  displayName,
  avatarUrl,
  loading,
  createdDate,
  callout,
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
      url={callout.framing.profile.url}
      footerComponent={footerComponent}
      contextDisplayName={callout.framing.profile.displayName}
      createdDate={createdDate}
    />
  );
};
