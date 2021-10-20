import React, { FC, useMemo } from 'react';
import { ContributionCardDetails } from '../../components/composite/common/cards';
import {
  useChallengeContributionDetailsQuery,
  useEcoverseContributionDetailsQuery,
  useOpportunityContributionDetailsQuery,
} from '../../hooks/generated/graphql';
import { Container } from '../../models/container';
import { ContributionItem } from '../../models/entities/contribution';

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
        // TODO Switch to banner when banner can be uploaded
        image: ecoverseData.ecoverse.context?.visual?.avatar,
        tags: ecoverseData.ecoverse.tagset?.tags || [],
      } as ContributionCardDetails;

    if (challengeData)
      return {
        name: challengeData.ecoverse.challenge.displayName,
        type: 'challenge',
        // TODO Switch to banner when banner can be uploaded
        image: challengeData.ecoverse.challenge.context?.visual?.avatar,
        tags: challengeData.ecoverse.challenge.tagset?.tags || [],
      } as ContributionCardDetails;

    if (opportunityData)
      return {
        name: opportunityData.ecoverse.opportunity.displayName,
        type: 'challenge',
        // TODO Switch to banner when banner can be uploaded
        image: opportunityData.ecoverse.opportunity.context?.visual?.avatar,
        tags: opportunityData.ecoverse.opportunity.tagset?.tags || [],
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
