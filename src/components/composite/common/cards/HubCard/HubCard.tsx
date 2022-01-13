import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { buildEcoverseUrl } from '../../../../../utils/urlBuilders';
import getActivityCount from '../../../../../utils/get-activity-count';
import { Ecoverse, Nvp } from '../../../../../models/graphql-schema';
import EntityContributionCard from '../ContributionCard/EntityContributionCard';
import { useUserContext } from '../../../../../hooks';

type NeededFields = 'displayName' | 'context' | 'tagset' | 'nameID' | 'authorization' | 'id';
export interface HubCardProps {
  ecoverse: Pick<Ecoverse, NeededFields> & { activity?: (Pick<Nvp, 'name' | 'value'> | Nvp)[] };
  loading?: boolean;
}

const HubCard: FC<HubCardProps> = ({ ecoverse, loading = false }) => {
  const { t } = useTranslation();
  const { user } = useUserContext();

  const isMember = useCallback(
    (hubId: string) => {
      return user?.ofEcoverse(hubId) ?? false;
    },
    [user]
  );

  const { activity = [] } = ecoverse;
  return (
    <EntityContributionCard
      details={{
        headerText: ecoverse.displayName,
        descriptionText: ecoverse?.context?.tagline,
        mediaUrl: ecoverse?.context?.visual?.banner,
        tags: ecoverse.tagset?.tags || [],
        tagsFor: 'hub',
        url: buildEcoverseUrl(ecoverse.nameID),
      }}
      isMember={isMember(ecoverse.id)}
      isAnonymous={ecoverse.authorization?.anonymousReadAccess}
      loading={loading}
      activities={[
        {
          name: t('pages.activity.challenges'),
          digit: getActivityCount(activity, 'challenges') ?? 0,
          color: 'primary',
        },
        {
          name: t('pages.activity.opportunities'),
          digit: getActivityCount(activity, 'opportunities') ?? 0,
          color: 'primary',
        },
        {
          name: t('pages.activity.members'),
          digit: getActivityCount(activity, 'members') ?? 0,
          color: 'positive',
        },
      ]}
    />
  );
};
export default HubCard;
