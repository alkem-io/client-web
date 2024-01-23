import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import replaceQuotesInOldDescription from '../../../../shared/utils/replaceQuotesInOldDescription';
import { ActivitySubject } from '../types/ActivitySubject';
import ActivityDescriptionByType from '../../../../shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityEventType } from '../../../../../core/apollo/generated/graphql-schema';

interface ActivityCalloutPostCommentCreatedViewProps extends ActivityViewProps {
  post: ActivitySubject;
  description: string;
  type: ActivityEventType.CalloutPostComment;
}

export const ActivityCalloutPostCommentCreatedView: FC<ActivityCalloutPostCommentCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  post,
  description,
  type,
  footerComponent,
}) => {
  const comment = replaceQuotesInOldDescription(description);

  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      type={type}
      title={<ActivityDescriptionByType activityType={type} subject={comment} />}
      url={post.profile.url}
      footerComponent={footerComponent}
      contextDisplayName={post.profile.displayName}
      createdDate={createdDate}
    />
  );
};
