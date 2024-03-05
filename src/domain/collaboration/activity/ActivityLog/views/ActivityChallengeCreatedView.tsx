import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { ActivitySubject } from '../types/ActivitySubject';
import ActivityDescriptionByType from '../../../../shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityEventType } from '../../../../../core/apollo/generated/graphql-schema';

interface ActivityChallengeCreatedViewProps extends ActivityViewProps {
  challenge: ActivitySubject;
  type: ActivityEventType.ChallengeCreated;
}

export const ActivityChallengeCreatedView: FC<ActivityChallengeCreatedViewProps> = ({
  avatarUrl,
  loading,
  createdDate,
  journeyDisplayName,
  challenge,
  type,
}) => {
  return (
    <ActivityBaseView
      avatarUrl={avatarUrl}
      loading={loading}
      type={type}
      title={<ActivityDescriptionByType activityType={type} subject={challenge.profile.displayName} />}
      url={challenge.profile.url}
      contextDisplayName={journeyDisplayName}
      createdDate={createdDate}
    />
  );
};
