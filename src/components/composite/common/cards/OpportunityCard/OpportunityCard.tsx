import React, { FC, useCallback } from 'react';
import { Nvp, Opportunity, VisualUriFragment } from '../../../../../models/graphql-schema';
import { useTranslation } from 'react-i18next';
import EntityContributionCard from '../ContributionCard/EntityContributionCard';
import { buildOpportunityUrl } from '../../../../../utils/urlBuilders';
import getActivityCount from '../../../../../utils/get-activity-count';
import { useUserContext } from '../../../../../hooks';
import { getVisualBannerNarrow } from '../../../../../utils/visuals.utils';

type NeededFields = 'displayName' | 'tagset' | 'nameID' | 'authorization' | 'id';
export interface OpportunityCardProps {
  opportunity: Pick<Opportunity, NeededFields> & { activity?: (Pick<Nvp, 'name' | 'value'> | Nvp)[] } & {
    context?: { tagline?: string; visuals?: VisualUriFragment[] };
  };
  ecoverseNameId: string;
  challengeNameId: string;
  loading?: boolean;
}

const OpportunityCard: FC<OpportunityCardProps> = ({
  opportunity,
  ecoverseNameId,
  challengeNameId,
  loading = false,
}) => {
  const { t } = useTranslation();
  const { user } = useUserContext();

  const isMember = useCallback(
    (opportunityId: string) => {
      return user?.ofOpportunity(opportunityId) ?? false;
    },
    [user]
  );

  const bannerNarrow = getVisualBannerNarrow(opportunity?.context?.visuals);
  const { activity = [] } = opportunity;

  return (
    <EntityContributionCard
      details={{
        headerText: opportunity.displayName,
        descriptionText: opportunity?.context?.tagline,
        mediaUrl: bannerNarrow,
        tags: opportunity.tagset?.tags || [],
        tagsFor: 'opportunity',
        url: buildOpportunityUrl(ecoverseNameId, challengeNameId, opportunity.nameID),
      }}
      isMember={isMember(opportunity.id)}
      loading={loading}
      activities={[
        { name: t('common.projects'), digit: getActivityCount(activity, 'projects') ?? 0 },
        { name: t('common.members'), digit: getActivityCount(activity, 'members') ?? 0 },
      ]}
    />
  );
};
export default OpportunityCard;
