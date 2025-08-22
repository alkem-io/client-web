import { useTranslation } from 'react-i18next';
import { InAppNotificationProps } from '../useInAppNotifications';
import { InAppNotificationBaseView, InAppNotificationBaseViewProps } from './InAppNotificationBaseView';
import { useMemo } from 'react';
import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

export const CollaborationCalloutPublishedView = ({
  id,
  type,
  state,
  space,
  callout,
  triggeredBy,
  triggeredAt,
}: InAppNotificationProps) => {
  const { t } = useTranslation();

  const notification: InAppNotificationBaseViewProps = useMemo(() => {
    const spaceLevel = space?.level ?? SpaceLevel.L0;
    const notificationTextValues = {
      defaultValue: '',
      spaceName: space?.about.profile?.displayName,
      spaceLevel: t(`common.space-level.${spaceLevel}`),
      calloutName: callout?.framing?.profile?.displayName,
      contributorName: triggeredBy?.profile?.displayName,
    };

    return {
      id,
      type,
      state,
      space: {
        id: space?.id,
        avatarUrl: space?.about.profile?.visual?.uri ?? '',
        avatarAlt: space?.about.profile?.displayName ?? '', // Optional alt text for the avatar
      },
      resource: {
        url: callout?.framing?.profile?.url ?? '',
      },
      contributor: {
        avatarUrl: triggeredBy?.profile?.visual?.uri ?? '',
      },
      triggeredAt: triggeredAt,
      values: notificationTextValues,
    };
  }, [id, state, space, callout, triggeredBy, triggeredAt, t]);

  // do not display notification if these are missing
  if (
    !callout ||
    !callout.framing?.profile?.displayName ||
    !callout?.framing?.profile?.url ||
    !triggeredBy?.profile?.displayName
  ) {
    return null;
  }

  return <InAppNotificationBaseView {...notification} />;
};
