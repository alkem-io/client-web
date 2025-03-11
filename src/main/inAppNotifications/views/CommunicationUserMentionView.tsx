import { InAppNotificationProps } from '../useInAppNotifications';
import { InAppNotificationBaseView, InAppNotificationBaseViewProps } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const CommunicationUserMentionView = ({
  id,
  type,
  state,
  space,
  triggeredBy,
  triggeredAt,
  comment,
  commentUrl,
  commentOriginName,
}: InAppNotificationProps) => {
  const notification: InAppNotificationBaseViewProps = useMemo(() => {
    const notificationTextValues = {
      defaultValue: '',
      commenterName: triggeredBy?.profile?.displayName,
      calloutName: commentOriginName,
      comment,
    };

    return {
      id,
      type,
      state: state,
      space: {
        avatarUrl: space?.about.profile?.visual?.uri ?? '',
      },
      resource: {
        url: commentUrl ?? '',
      },
      contributor: {
        avatarUrl: triggeredBy?.profile?.visual?.uri ?? '',
      },
      triggeredAt: triggeredAt,
      values: notificationTextValues,
    };
  }, [id, state, space, triggeredBy, commentOriginName, triggeredAt, comment, commentUrl]);

  // do not display notification if these are missing
  if (!commentOriginName || !commentUrl || !triggeredBy?.profile?.displayName) {
    return null;
  }

  return <InAppNotificationBaseView {...notification} />;
};
