import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { ActivitySubject } from '../types/ActivitySubject';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';

interface ActivitySpaceL1CreatedViewProps extends ActivityViewProps {
  subspace: {
    about: ActivitySubject;
  };
  type: ActivityEventType.ChallengeCreated;
}

export const ActivitySpaceL1CreatedView = ({
  spaceDisplayName,
  subspace,
  type,
  ...rest
}: ActivitySpaceL1CreatedViewProps) => (
  <ActivityBaseView
    type={type}
    title={<ActivityDescriptionByType activityType={type} subject={subspace.about.profile.displayName} />}
    url={subspace.about.profile.url}
    contextDisplayName={spaceDisplayName}
    {...rest}
  />
);
