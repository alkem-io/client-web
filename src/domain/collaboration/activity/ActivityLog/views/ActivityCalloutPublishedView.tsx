import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import ActivityDescriptionByType from '../../../../shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityCalloutValues } from '../../../../shared/types/ActivityCalloutValues';
import { ActivityEventType, CalloutType } from '../../../../../core/apollo/generated/graphql-schema';

interface ActivityCalloutPublishedViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues & { type: CalloutType };
  type: ActivityEventType.CalloutPublished;
}

export const ActivityCalloutPublishedView: FC<ActivityCalloutPublishedViewProps> = ({
  avatarUrl,
  loading,
  createdDate,
  journeyDisplayName,
  callout,
  type,
}) => {
  return (
    <ActivityBaseView
      avatarUrl={avatarUrl}
      loading={loading}
      type={type}
      calloutType={callout.type}
      title={<ActivityDescriptionByType activityType={type} subject={callout.framing.profile.displayName} />}
      url={callout.framing.profile.url}
      contextDisplayName={journeyDisplayName}
      createdDate={createdDate}
    />
  );
};
