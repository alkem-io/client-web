import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { ActivitySubject } from '../types/ActivitySubject';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';

interface ActivityOpportunityCreatedViewProps extends ActivityViewProps {
  subsubspace: {
    about: ActivitySubject;
  };
  type: ActivityEventType.OpportunityCreated;
}

export const ActivityOpportunityCreatedView = ({
  createdDate,
  journeyDisplayName,
  subsubspace,
  type,
  ...rest
}: ActivityOpportunityCreatedViewProps) => (
  <ActivityBaseView
    type={type}
    title={<ActivityDescriptionByType activityType={type} subject={subsubspace.about.profile.displayName} />}
    url={subsubspace.about.profile.url}
    contextDisplayName={journeyDisplayName}
    createdDate={createdDate}
    {...rest}
  />
);
