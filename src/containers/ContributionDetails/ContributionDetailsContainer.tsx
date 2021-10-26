import React, { FC, useMemo } from 'react';
import { ContributionCardDetails } from '../../components/composite/common/cards';
import {
  useChallengeContributionDetailsQuery,
  useEcoverseContributionDetailsQuery,
  useOpportunityContributionDetailsQuery,
} from '../../hooks/generated/graphql';
import { Container } from '../../models/container';
import { ContributionItem } from '../../models/entities/contribution';
import { buildChallengeUrl, buildEcoverseUrl, buildOpportunityUrl } from '../../utils/urlBuilders';

export interface EntityDetailsContainerEntities {
  details?: ContributionCardDetails;
}

export interface EntityDetailsContainerState {
  loading: boolean;
}

export interface EntityDetailsContainerActions {}

export interface EntityDetailsContainerProps
  extends Container<EntityDetailsContainerEntities, EntityDetailsContainerActions, EntityDetailsContainerState> {
  entities: ContributionItem;
}

const ContributionDetailsContainer: FC<EntityDetailsContainerProps> = ({ entities, children }) => {
  const { ecoverseId, challengeId, opportunityId } = entities;
  const { data: ecoverseData, loading: ecoverseLoading } = useEcoverseContributionDetailsQuery({
    variables: {
      ecoverseId: ecoverseId,
    },
    skip: Boolean(challengeId) || Boolean(opportunityId),
  });

  const { data: challengeData, loading: challengeLoading } = useChallengeContributionDetailsQuery({
    variables: {
      ecoverseId: ecoverseId,
      challengeId: challengeId || '',
    },
    skip: !challengeId || Boolean(opportunityId),
  });

  const { data: opportunityData, loading: opportunityLoading } = useOpportunityContributionDetailsQuery({
    variables: {
      ecoverseId: ecoverseId,
      opportunityId: opportunityId || '',
    },
    skip: !opportunityId,
  });

  const details = useMemo(() => {
    if (ecoverseData)
      return {
        name: ecoverseData.ecoverse.displayName,
        type: 'ecoverse',
        image: ecoverseData.ecoverse.context?.visual?.banner,
        tags: ecoverseData.ecoverse.tagset?.tags || [],
        url: buildEcoverseUrl(ecoverseData.ecoverse.nameID),
      } as ContributionCardDetails;

    if (challengeData)
      return {
        name: challengeData.ecoverse.challenge.displayName,
        type: 'challenge',
        image: challengeData.ecoverse.challenge.context?.visual?.banner,
        tags: challengeData.ecoverse.challenge.tagset?.tags || [],
        url: buildChallengeUrl(challengeData.ecoverse.nameID, challengeData.ecoverse.challenge.nameID),
      } as ContributionCardDetails;

    if (opportunityData)
      return {
        name: opportunityData.ecoverse.opportunity.displayName,
        type: 'opportunity',
        image: opportunityData.ecoverse.opportunity.context?.visual?.banner,
        tags: opportunityData.ecoverse.opportunity.tagset?.tags || [],
        url: buildOpportunityUrl(
          opportunityData.ecoverse.nameID,
          opportunityData.ecoverse.opportunity.challenge?.nameID || '',
          opportunityData.ecoverse.opportunity.nameID
        ),
      } as ContributionCardDetails;
  }, [ecoverseData, challengeData, opportunityData]);

  return (
    <>
      {children(
        { details },
        {
          loading: ecoverseLoading || challengeLoading || opportunityLoading,
        },
        {}
      )}
    </>
  );
};
export default ContributionDetailsContainer;
