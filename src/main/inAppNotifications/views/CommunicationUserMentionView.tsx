import { InAppNotificationProps } from '../useInAppNotifications';
import { InAppNotificationBaseView, InAppNotificationBaseViewProps } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const CommunicationUserMentionView = ({
  type,
  state,
  space,
  callout,
  triggeredBy,
  triggeredAt,
}: InAppNotificationProps) => {
  const notification: InAppNotificationBaseViewProps = useMemo(() => {
    return {
      state: state,
      space: {
        avatarUrl: space?.profile.visual?.uri ?? '',
      },
      subject: {
        url: callout?.profile.url ?? '',
      },
      triggeredAt: triggeredAt,
      description: {
        key: `components.inAppNotifications.description.${type}`,
        values: {
          defaultValue: '',
          commenterName: triggeredBy?.profile?.displayName,
          colloutName: callout?.profile.displayName,
          comment: '', // TODO:notificaiton comment
        },
      },
    };
  }, [state, space, callout, triggeredBy, triggeredAt]);

  return <InAppNotificationBaseView {...notification} />;
};
