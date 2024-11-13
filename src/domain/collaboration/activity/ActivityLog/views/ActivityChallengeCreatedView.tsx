import React, { FC } from 'react';
import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { ActivitySubject } from '../types/ActivitySubject';
import ActivityDescriptionByType from '../../../../shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityEventType } from '@core/apollo/generated/graphql-schema';

interface ActivityChallengeCreatedViewProps extends ActivityViewProps {
  subspace: ActivitySubject;
  type: ActivityEventType.ChallengeCreated;
}

export const ActivityChallengeCreatedView: FC<ActivityChallengeCreatedViewProps> = ({
  journeyDisplayName,
  subspace,
  type,
  ...rest
}) => {
  return (
    <ActivityBaseView
      type={type}
      title={<ActivityDescriptionByType activityType={type} subject={subspace.profile.displayName} />}
      url={subspace.profile.url}
      contextDisplayName={journeyDisplayName}
      {...rest}
    />
  );
};
