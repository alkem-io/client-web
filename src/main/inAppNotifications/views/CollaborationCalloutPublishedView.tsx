import { useTranslation } from 'react-i18next';
import { InAppNotificationBaseView } from './InAppNotificationBaseView';
import { useMemo } from 'react';
import { NotificationEventPayload, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { InAppNotificationModel } from '../model/InAppNotificationModel';

export const CollaborationCalloutPublishedView = ({
  id,
  type,
  state,
  category,
  payload,
  triggeredBy,
  triggeredAt,
}: InAppNotificationModel) => {
  const { t } = useTranslation();

  const spaceLevel = payload.space?.level ?? SpaceLevel.L0;

  const notificationTextValues = {
    defaultValue: '',
    spaceName: payload.space?.about?.profile?.displayName,
    spaceLevel: t(`common.space-level.${spaceLevel}`),
    calloutName: payload.callout?.framing?.profile?.displayName,
    contributorName: triggeredBy?.profile?.displayName,
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
        type: NotificationEventPayload.SpaceCollaborationCallout,
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
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={payload.callout.framing?.profile?.url}
    />
  );
};
