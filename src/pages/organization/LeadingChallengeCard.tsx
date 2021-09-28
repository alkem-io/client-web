import React, { FC } from 'react';
import CardProps from './CardProps';
import ChallengeCard from '../../components/Ecoverse/ChallengeCard';
import { useUserContext } from '../../hooks';
import { useChallengeCardQuery } from '../../hooks/generated/graphql';
import Loading from '../../components/core/Loading/Loading';
import { buildChallengeUrl } from '../../utils/urlBuilders';

const LeadingChallengeCard: FC<CardProps> = ({ id, ecoverseID }) => {
  const { user } = useUserContext();
  const { data } = useChallengeCardQuery({
    variables: {
      ecoverseId: ecoverseID as string,
      challengeId: id,
    },
  });

  const challenge = data?.ecoverse?.challenge;
  const ecoverseNameID = data?.ecoverse.nameID || '';

  if (!challenge) {
    return <Loading text="" />;
  }

  return (
    <ChallengeCard
      id={challenge.id}
      displayName={challenge.displayName}
      activity={challenge.activity || []}
      context={{
        tagline: challenge.context?.tagline || '',
        visual: { background: challenge.context?.visual?.background || '' },
      }}
      isMember={user?.ofChallenge(challenge.id) || false}
      tags={challenge?.tagset?.tags || []}
      url={buildChallengeUrl(ecoverseNameID, challenge.nameID)}
    />
  );
};
export default LeadingChallengeCard;
