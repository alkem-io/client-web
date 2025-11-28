import { ActivityBaseView } from './ActivityBaseView';
import { ActivityViewProps } from './ActivityViewProps';
import { ActivitySubject } from '../types/ActivitySubject';
import ActivityDescriptionByType from '@/domain/shared/components/ActivityDescription/ActivityDescriptionByType';
import { ActivityCalloutValues } from '@/domain/shared/types/ActivityCalloutValues';
import { ActivityEventType } from '@/core/apollo/generated/graphql-schema';

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
