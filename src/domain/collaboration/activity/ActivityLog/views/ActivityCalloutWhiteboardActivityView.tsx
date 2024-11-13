import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { ActivitySubject } from '../types/ActivitySubject';
import ActivityDescriptionByType from '../../../../shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityCalloutValues } from '../../../../shared/types/ActivityCalloutValues';
import { ActivityEventType } from '@core/apollo/generated/graphql-schema';

interface ActivityCalloutWhiteboardActivityViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues;
  whiteboard: ActivitySubject;
  type: ActivityEventType.CalloutWhiteboardCreated | ActivityEventType.CalloutWhiteboardContentModified;
}

export const ActivityCalloutWhiteboardActivityView: FC<ActivityCalloutWhiteboardActivityViewProps> = ({
  avatarUrl,
  loading,
  createdDate,
  callout,
  whiteboard,
  type,
}) => {
  return (
    <ActivityBaseView
      avatarUrl={avatarUrl}
      loading={loading}
      type={type}
      title={<ActivityDescriptionByType activityType={type} subject={whiteboard.profile.displayName} />}
      url={whiteboard.profile.url}
      contextDisplayName={callout.framing.profile.displayName}
      createdDate={createdDate}
    />
  );
};
