import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { ActivitySubject } from '../types/ActivitySubject';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';

interface ActivityChallengeCreatedViewProps extends ActivityViewProps {
  subspace: ActivitySubject;
  type: ActivityEventType.ChallengeCreated;
}

export const ActivityChallengeCreatedView = ({
  journeyDisplayName,
  subspace,
  type,
  ...rest
}: ActivityChallengeCreatedViewProps) => (
  <ActivityBaseView
    type={type}
    title={<ActivityDescriptionByType activityType={type} subject={subspace.profile.displayName} />}
    url={subspace.profile.url}
    contextDisplayName={journeyDisplayName}
    {...rest}
  />
);
