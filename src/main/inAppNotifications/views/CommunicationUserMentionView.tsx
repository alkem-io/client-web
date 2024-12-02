import { InAppNotificationProps } from '../useInAppNotifications';
import { InAppNotificationBaseView, InAppNotificationBaseViewProps } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const CommunicationUserMentionView = ({
  id,
  type,
  state,
  space,
  callout,
  triggeredBy,
  triggeredAt,
  comment,
  commentUrl,
}: InAppNotificationProps) => {
  const notification: InAppNotificationBaseViewProps = useMemo(() => {
    const notificationTextValues = {
      defaultValue: '',
      commenterName: triggeredBy?.profile?.displayName,
      calloutName: callout?.framing?.profile?.displayName,
      comment,
    };

    return {
      id,
      type,
      state: state,
      space: {
        avatarUrl: space?.profile?.visual?.uri ?? '',
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
  }, [id, state, space, triggeredBy, callout, triggeredAt, comment, commentUrl]);

  return <InAppNotificationBaseView {...notification} />;
};
