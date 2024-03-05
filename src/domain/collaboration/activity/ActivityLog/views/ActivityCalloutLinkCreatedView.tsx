import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import ActivityDescriptionByType from '../../../../shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityCalloutValues } from '../../../../shared/types/ActivityCalloutValues';
import { ActivityEventType } from '../../../../../core/apollo/generated/graphql-schema';

interface ActivityCalloutLinkCreatedViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues;
  link: {
    profile: {
      displayName: string;
    };
  };
  type: ActivityEventType.CalloutLinkCreated;
}

export const ActivityCalloutLinkCreatedView: FC<ActivityCalloutLinkCreatedViewProps> = ({
  avatarUrl,
  loading,
  createdDate,
  callout,
  link,
  type,
}) => {
  return (
    <ActivityBaseView
      avatarUrl={avatarUrl}
      loading={loading}
      type={type}
      title={<ActivityDescriptionByType activityType={type} subject={link.profile.displayName} />}
      url={callout.framing.profile.url}
      contextDisplayName={callout.framing.profile.displayName}
      createdDate={createdDate}
    />
  );
};
