import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { ActivitySubject } from '../types/ActivitySubject';
import ActivityDescriptionByType from '../../../../shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityCalloutValues } from '../../../../shared/types/ActivityCalloutValues';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';

interface ActivityCalloutPostCreatedViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues;
  post: ActivitySubject;
  type: ActivityEventType.CalloutPostCreated;
}

export const ActivityCalloutPostCreatedView: FC<ActivityCalloutPostCreatedViewProps> = ({
  callout,
  post,
  type,
  ...rest
}) => {
  return (
    <ActivityBaseView
      type={type}
      title={<ActivityDescriptionByType activityType={type} subject={post.profile.displayName} />}
      url={post.profile.url}
      contextDisplayName={callout.framing.profile.displayName}
      {...rest}
    />
  );
};
