import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { ActivitySubject } from '../types/ActivitySubject';
import ActivityDescriptionByType from '../../../../shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityEventType } from '../../../../../core/apollo/generated/graphql-schema';

interface ActivityOpportunityCreatedViewProps extends ActivityViewProps {
  opportunity: ActivitySubject;
  type: ActivityEventType.OpportunityCreated;
}

export const ActivityOpportunityCreatedView: FC<ActivityOpportunityCreatedViewProps> = ({
  avatarUrl,
  loading,
  createdDate,
  journeyDisplayName,
  opportunity,
  type,
}) => {
  return (
    <ActivityBaseView
      type={type}
      avatarUrl={avatarUrl}
      loading={loading}
      title={<ActivityDescriptionByType activityType={type} subject={opportunity.profile.displayName} />}
      url={opportunity.profile.url}
      contextDisplayName={journeyDisplayName}
      createdDate={createdDate}
    />
  );
};
