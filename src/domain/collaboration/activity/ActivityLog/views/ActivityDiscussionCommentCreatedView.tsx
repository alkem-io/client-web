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
  callout,
  description,
  type,
  ...rest
}) => {
  return (
    <ActivityBaseView
      type={type}
      title={<ActivitySubjectMarkdown>{description}</ActivitySubjectMarkdown>}
      url={callout.framing.profile.url}
      contextDisplayName={callout.framing.profile.displayName}
      {...rest}
    />
  );
};
