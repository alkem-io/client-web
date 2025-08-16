import { NotificationEventPayload } from '@/core/apollo/generated/graphql-schema';
import { InAppNotificationModel } from '../model/InAppNotificationModel';
import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { InAppNotificationBaseView } from './InAppNotificationBaseView';

export const CommunicationUserMentionView = ({
  id,
  type,
  state,
  payload,
  category,
  triggeredBy,
  triggeredAt,
}: InAppNotificationModel) => {
  const { t } = useTranslation();

  const notificationTextValues = {
    defaultValue: '',
    commenterName: triggeredBy?.profile?.displayName,
    calloutName: payload.commentOriginName,
    comment: payload.comment,
  };
  const notification: InAppNotificationModel = useMemo(() => {
    return {
      id,
      type,
      category,
      state,
      triggeredAt: triggeredAt,
      triggeredBy: {
        avatarUrl: triggeredBy?.profile?.visual?.uri ?? '',
        ...triggeredBy,
      },
      payload: {
        type: NotificationEventPayload.UserMessageRoom,
        space: {
          id: payload.space?.id,
          avatarUrl: payload.space?.about?.profile?.visual?.uri ?? '',
          about: {
            profile: { ...payload.space?.about?.profile },
          },
        },
      },
    };
  }, [id, state, payload, triggeredBy, triggeredAt, t]);

  // do not display notification if these are missing
  if (
    !payload.callout ||
    !payload.callout.framing?.profile?.displayName ||
    !payload.callout.framing?.profile?.url ||
    !triggeredBy?.profile?.displayName
  ) {
    return null;
  }

  return (
    <InAppNotificationBaseView notification={notification} values={notificationTextValues} url={payload.commentUrl} />
  );
};
