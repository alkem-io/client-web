import { NotificationEventPayload } from '@/core/apollo/generated/graphql-schema';
import { InAppNotificationModel } from '../model/InAppNotificationModel';
import { InAppNotificationBaseView } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const InAppSpaceCommunityNewMemberView = ({
  id,
  type,
  state,
  payload,
  triggeredAt,
  category,
}: InAppNotificationModel) => {
  const notificationTextValues = {
    defaultValue: '',
    spaceName: payload?.space?.about?.profile?.displayName,
  };
  const notification: InAppNotificationModel = useMemo(() => {
    return {
      id,
      type,
      state,
      category,
      triggeredAt: triggeredAt,
      payload: {
        type: NotificationEventPayload.SpaceCommunityContributor,
        space: {
          id: payload.space?.id,
          avatarUrl: payload.space?.about?.profile?.visual?.uri ?? '',
        },
      },
    };
  }, [id, state, payload, triggeredAt]);

  // do not display notification if these are missing
  if (!payload.space?.about?.profile?.displayName) {
    return null;
  }

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={payload.space?.about?.profile?.url}
    />
  );
};
