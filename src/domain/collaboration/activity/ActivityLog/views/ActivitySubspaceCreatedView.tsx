import type { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import type { ActivitySubject } from '../types/ActivitySubject';
import { ActivityBaseView } from './ActivityBaseView';
import type { ActivityViewProps } from './ActivityViewProps';

interface ActivitySubspaceCreatedViewProps extends ActivityViewProps {
  subspace: {
    about: ActivitySubject;
  };
  type: ActivityEventType.SubspaceCreated;
}

export const ActivitySubspaceCreatedView = ({
  spaceDisplayName,
  subspace,
  type,
  ...rest
}: ActivitySubspaceCreatedViewProps) => (
  <ActivityBaseView
    type={type}
    title={<ActivityDescriptionByType activityType={type} subject={subspace.about.profile.displayName} />}
    url={subspace.about.profile.url}
    contextDisplayName={spaceDisplayName}
    {...rest}
  />
);
