import React, { FC, useCallback } from 'react';
import { Nvp, Opportunity, VisualUriFragment } from '../../../../../models/graphql-schema';
import { useTranslation } from 'react-i18next';
import EntityContributionCard, { EntityContributionCardLabel } from '../ContributionCard/EntityContributionCard';
import { buildOpportunityUrl } from '../../../../../common/utils/urlBuilders';
import getActivityCount from '../../../../../domain/activity/utils/getActivityCount';
import { useUserContext } from '../../../../../hooks';
import { getVisualBannerNarrow } from '../../../../../common/utils/visuals.utils';

type NeededFields = 'displayName' | 'tagset' | 'nameID' | 'authorization' | 'id';
export interface OpportunityCardProps {
  opportunity: Pick<Opportunity, NeededFields> & { activity?: (Pick<Nvp, 'name' | 'value'> | Nvp)[] } & {
    context?: { tagline?: string; visuals?: VisualUriFragment[] };
  };
  hubNameId: string;
  challengeNameId: string;
  loading?: boolean;
}

const OpportunityCard: FC<OpportunityCardProps> = ({ opportunity, hubNameId, challengeNameId, loading = false }) => {
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
        url: buildOpportunityUrl(hubNameId, challengeNameId, opportunity.nameID),
      }}
      label={isMember(opportunity.id) ? EntityContributionCardLabel.Member : undefined}
      loading={loading}
      activities={[{ name: t('common.members'), count: getActivityCount(activity, 'members') }]}
    />
  );
};
export default OpportunityCard;
