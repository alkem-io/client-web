import type { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import type { ActivityCalloutValues } from '@/domain/shared/types/ActivityCalloutValues';
import type { ActivitySubject } from '../types/ActivitySubject';
import { ActivityBaseView } from './ActivityBaseView';
import type { ActivityViewProps } from './ActivityViewProps';

interface ActivityCalloutWhiteboardActivityViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues;
  whiteboard: ActivitySubject;
  type: ActivityEventType.CalloutWhiteboardCreated | ActivityEventType.CalloutWhiteboardContentModified;
}

export const ActivityCalloutWhiteboardActivityView = ({
  avatarUrl,
  loading,
  createdDate,
  callout,
  whiteboard,
  type,
}: ActivityCalloutWhiteboardActivityViewProps) => (
  <ActivityBaseView
    avatarUrl={avatarUrl}
    loading={loading}
    type={type}
    title={<ActivityDescriptionByType activityType={type} subject={whiteboard.profile.displayName} />}
    url={whiteboard.profile.url}
    contextDisplayName={callout.framing.profile.displayName}
    createdDate={createdDate}
  />
);
