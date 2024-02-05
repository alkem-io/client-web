import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { ActivitySubject } from '../types/ActivitySubject';
import ActivityDescriptionByType from '../../../../shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityCalloutValues } from '../../../../shared/types/ActivityCalloutValues';
import { ActivityEventType } from '../../../../../core/apollo/generated/graphql-schema';

interface ActivityCalloutWhiteboardCreatedViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues;
  whiteboard: ActivitySubject;
  type: ActivityEventType.CalloutWhiteboardCreated;
}

export const ActivityCalloutWhiteboardCreatedView: FC<ActivityCalloutWhiteboardCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  callout,
  whiteboard,
  type,
  footerComponent,
}) => {
  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      type={type}
      title={<ActivityDescriptionByType activityType={type} subject={whiteboard.profile.displayName} />}
      url={whiteboard.profile.url}
      footerComponent={footerComponent}
      contextDisplayName={callout.framing.profile.displayName}
      createdDate={createdDate}
    />
  );
};
