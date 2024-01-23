import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import ActivityDescriptionByType from '../../../../shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityCalloutValues } from '../../../../shared/types/ActivityCalloutValues';
import { ActivityEventType } from '../../../../../core/apollo/generated/graphql-schema';

interface ActivityCalloutLinkCreatedViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues;
  reference: {
    name: string;
  };
  type: ActivityEventType.CalloutLinkCreated;
}

export const ActivityCalloutLinkCreatedView: FC<ActivityCalloutLinkCreatedViewProps> = ({
  author,
  loading,
  createdDate,
  callout,
  reference,
  type,
  footerComponent,
}) => {
  return (
    <ActivityBaseView
      author={author}
      loading={loading}
      type={type}
      title={<ActivityDescriptionByType activityType={type} subject={reference.name} />}
      url={callout.framing.profile.url}
      footerComponent={footerComponent}
      contextDisplayName={callout.framing.profile.displayName}
      createdDate={createdDate}
    />
  );
};
