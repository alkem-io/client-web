import React, { FC, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Challenge, Nvp } from '../../../../../models/graphql-schema';
import EntityContributionCard from '../ContributionCard/EntityContributionCard';
import { buildChallengeUrl } from '../../../../../utils/urlBuilders';
import getActivityCount from '../../../../../utils/get-activity-count';
import { useUserContext } from '../../../../../hooks';

type NeededFields = 'displayName' | 'context' | 'tagset' | 'nameID' | 'authorization' | 'id';
export interface ChallengeCardProps {
  challenge: Pick<Challenge, NeededFields> & { activity?: (Pick<Nvp, 'name' | 'value'> | Nvp)[] };
  ecoverseNameId: string;
  loading?: boolean;
}

const ChallengeCard: FC<ChallengeCardProps> = ({ challenge, ecoverseNameId, loading = false }) => {
  const { t } = useTranslation();
  const { user } = useUserContext();

  const isMember = useCallback(
    (challengeId: string) => {
      return user?.ofChallenge(challengeId) ?? false;
    },
    [user]
  );
  const { activity = [] } = challenge;
  return (
    <EntityContributionCard
      details={{
        headerText: challenge.displayName,
        descriptionText: challenge?.context?.tagline,
        mediaUrl: challenge?.context?.visual?.banner,
        tags: challenge.tagset?.tags || [],
        tagsFor: 'challenge',
        url: buildChallengeUrl(ecoverseNameId, challenge.nameID),
      }}
      isMember={isMember(challenge.id)}
      loading={loading}
      activities={[
        {
          name: t('common.opportunities'),
          digit: getActivityCount(activity, 'opportunities') ?? 0,
        },
        {
          name: t('common.members'),
          digit: getActivityCount(activity, 'members') ?? 0,
        },
      ]}
    />
  );
};
export default ChallengeCard;
