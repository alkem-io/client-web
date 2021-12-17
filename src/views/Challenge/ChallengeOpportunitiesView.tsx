import { Box, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import OpportunityCard from '../../components/composite/entities/Challenge/OpportunityCard';
import { Loading } from '../../components/core';
import CardFilter from '../../components/core/card-filter/CardFilter';
import {
  entityTagsValueGetter,
  entityValueGetter,
} from '../../components/core/card-filter/value-getters/entity-value-getter';
import { CardContainer } from '../../components/core/CardContainer';
import ErrorBlock from '../../components/core/ErrorBlock';
import { ChallengeContainerEntities, ChallengeContainerState } from '../../containers/challenge/ChallengePageContainer';
import { useChallenge } from '../../hooks';
import { Opportunity } from '../../models/graphql-schema';
import { buildOpportunityUrl } from '../../utils/urlBuilders';

interface ChallengeOpportunitiesViewProps {
  entities: ChallengeContainerEntities;
  state: ChallengeContainerState;
}

export const ChallengeOpportunitiesView: FC<ChallengeOpportunitiesViewProps> = ({ entities, state }) => {
  const { t } = useTranslation();
  const opportunities = (entities.challenge?.opportunities ?? []) as Opportunity[];

  const { ecoverseNameId, challengeNameId, loading: loadingChallengeContext } = useChallenge();

  if (loadingChallengeContext || state.loading) return <Loading />;

  const description = (
    <Box paddingBottom={2} display="flex" justifyContent="center">
      {t('pages.challenge.sections.opportunities.description')}
    </Box>
  );

  if (state.error) {
    return (
      <>
        {description}
        <Box display="flex" justifyContent="center">
          <ErrorBlock blockName={t('common.opportunities')} />
        </Box>
      </>
    );
  }

  if (opportunities.length <= 0)
    return (
      <>
        {description}
        <Box paddingBottom={2} display="flex" justifyContent="center">
          <Typography>{t('pages.challenge.sections.opportunities.body-missing')}</Typography>
        </Box>
      </>
    );
  return (
    <>
      {description}
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
    </>
  );
};
