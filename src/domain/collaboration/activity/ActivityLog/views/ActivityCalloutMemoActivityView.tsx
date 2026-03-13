import type { ActivityEventType } from '@/core/apollo/generated/graphql-schema';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import type { ActivityCalloutValues } from '@/domain/shared/types/ActivityCalloutValues';
import type { ActivitySubject } from '../types/ActivitySubject';
import { ActivityBaseView } from './ActivityBaseView';
import type { ActivityViewProps } from './ActivityViewProps';

interface ActivityCalloutMemoActivityViewProps extends ActivityViewProps {
  callout: ActivityCalloutValues;
  memo: ActivitySubject;
  type: ActivityEventType.CalloutMemoCreated;
}

export const ActivityCalloutMemoActivityView = ({
  avatarUrl,
  loading,
  createdDate,
  callout,
  memo,
  type,
}: ActivityCalloutMemoActivityViewProps) => (
  <ActivityBaseView
    avatarUrl={avatarUrl}
    loading={loading}
    type={type}
    title={<ActivityDescriptionByType activityType={type} subject={memo.profile.displayName} />}
    url={memo.profile.url}
    contextDisplayName={callout.framing.profile.displayName}
    createdDate={createdDate}
  />
);
