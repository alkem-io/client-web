import React, { FC } from 'react';
import { ChallengeContainerEntities, ChallengeContainerState } from '../../containers/challenge/ChallengePageContainer';
import { Opportunity } from '../../models/graphql-schema';
import {
  entityTagsValueGetter,
  entityValueGetter,
} from '../../components/core/card-filter/value-getters/entity-value-getter';
import { CardContainer } from '../../components/core/CardContainer';
import OpportunityCard from '../../components/composite/entities/Challenge/OpportunityCard';
import { buildOpportunityUrl } from '../../utils/urlBuilders';
import CardFilter from '../../components/core/card-filter/CardFilter';
import { useTranslation } from 'react-i18next';
import { useChallenge } from '../../hooks';
import { Loading } from '../../components/core';
import { Grid } from '@mui/material';
import ErrorBlock from '../../components/core/ErrorBlock';

interface ChallengeOpportunitiesViewProps {
  entities: ChallengeContainerEntities;
  state: ChallengeContainerState;
}

export const ChallengeOpportunitiesView: FC<ChallengeOpportunitiesViewProps> = ({ entities, state }) => {
  const { t } = useTranslation();
  const opportunities = (entities.challenge?.opportunities ?? []) as Opportunity[];

  const { ecoverseNameId, challengeNameId, loading: loadingChallengeContext } = useChallenge();

  if (loadingChallengeContext || state.loading) return <Loading />;

  if (state.error) {
    return (
      <Grid container spacing={2}>
        <Grid item xs={12}>
          <ErrorBlock blockName={t('common.opportunities')} />
        </Grid>
      </Grid>
    );
  }

  return (
    <CardFilter data={opportunities} tagsValueGetter={entityTagsValueGetter} valueGetter={entityValueGetter}>
      {filteredData => (
        <CardContainer>
          {filteredData.map((opp, i) => (
            <OpportunityCard
              key={i}
              displayName={opp.displayName}
              activity={opp.activity || []}
              url={buildOpportunityUrl(ecoverseNameId, challengeNameId, opp.nameID)}
              lifecycle={{ state: opp?.lifecycle?.state || '' }}
              context={{
                tagline: opp?.context?.tagline || '',
                visual: { background: opp?.context?.visual?.background || '' },
              }}
              tags={opp?.tagset?.tags || []}
            />
          ))}
        </CardContainer>
      )}
    </CardFilter>
  );
};
