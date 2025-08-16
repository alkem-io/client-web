import { NotificationEvent } from '@/core/apollo/generated/graphql-schema';
import { InAppNotificationModel } from '../model/InAppNotificationModel';
import { InAppNotificationBaseView } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const CommunityNewMemberAdminView = ({ id, state, payload, triggeredAt, category }: InAppNotificationModel) => {
  const notificationTextValues = {
    defaultValue: '',
    spaceName: payload.space?.about?.profile?.displayName,
    memberType: payload.contributor?.type,
    memberName: payload.contributor?.profile?.displayName,
  };

  const notification: InAppNotificationModel = useMemo(() => {
    return {
      id,
      type: NotificationEvent.SpaceCommunityNewMemberAdmin,
      state,
      category,
      triggeredAt,
      payload: {
        type: payload.type,
        space: {
          id: payload.space?.id,
          level: payload.space?.level,
          avatarUrl: payload.space?.about?.profile?.visual?.uri ?? '',
          ...payload.space,
        },
      },
    };
  }, [id, state, payload.space, triggeredAt, payload.contributor]);

  // do not display notification if these are missing
  if (!payload.contributor?.profile?.displayName || !payload.space?.about?.profile?.displayName) {
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
