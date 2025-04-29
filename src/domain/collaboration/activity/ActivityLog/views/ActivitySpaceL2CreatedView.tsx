import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { ActivitySubject } from '../types/ActivitySubject';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';

interface ActivitySpaceL2CreatedViewProps extends ActivityViewProps {
  subsubspace: {
    about: ActivitySubject;
  };
  type: ActivityEventType.OpportunityCreated;
}

export const ActivitySpaceL2CreatedView = ({
  createdDate,
  spaceDisplayName,
  subsubspace,
  type,
  ...rest
}: ActivitySpaceL2CreatedViewProps) => (
  <ActivityBaseView
    type={type}
    title={<ActivityDescriptionByType activityType={type} subject={subsubspace.about.profile.displayName} />}
    url={subsubspace.about.profile.url}
    contextDisplayName={spaceDisplayName}
    createdDate={createdDate}
    {...rest}
  />
);
