import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { buildHubUrl } from '../../../../../utils/urlBuilders';
import getActivityCount from '../../../../../domain/activity/utils/getActivityCount';
import { Hub, Nvp, VisualUriFragment } from '../../../../../models/graphql-schema';
import EntityContributionCard from '../ContributionCard/EntityContributionCard';
import { useUserContext } from '../../../../../hooks';
import { getVisualBannerNarrow } from '../../../../../utils/visuals.utils';

type NeededFields = 'displayName' | 'tagset' | 'nameID' | 'authorization' | 'id';
export interface HubCardProps {
  hub: Pick<Hub, NeededFields> & { activity?: (Pick<Nvp, 'name' | 'value'> | Nvp)[] } & {
    context?: { tagline?: string; visuals?: VisualUriFragment[] };
  };
  loading?: boolean;
}

const HubCard: FC<HubCardProps> = ({ hub, loading = false }) => {
  const { t } = useTranslation();
  const { user } = useUserContext();

  const isMember = useCallback(
    (hubId: string) => {
      return user?.ofHub(hubId) ?? false;
    },
    [user]
  );

  const bannerNarrow = getVisualBannerNarrow(hub?.context?.visuals);
  const { activity = [] } = hub;

  return (
    <EntityContributionCard
      details={{
        headerText: hub.displayName,
        descriptionText: hub?.context?.tagline,
        mediaUrl: bannerNarrow,
        tags: hub.tagset?.tags || [],
        tagsFor: 'hub',
        url: buildHubUrl(hub.nameID),
      }}
      isMember={isMember(hub.id)}
      isAnonymous={hub.authorization?.anonymousReadAccess}
      loading={loading}
      activities={[
        {
          name: t('common.challenges'),
          count: getActivityCount(activity, 'challenges'),
          color: 'primary',
        },
        {
          name: t('common.opportunities'),
          count: getActivityCount(activity, 'opportunities'),
          color: 'primary',
        },
        {
          name: t('common.members'),
          count: getActivityCount(activity, 'members'),
          color: 'positive',
        },
      ]}
    />
  );
};
export default HubCard;
