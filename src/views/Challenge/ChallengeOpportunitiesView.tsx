import { Box, Typography } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import OpportunityCard from '../../components/composite/common/cards/OpportunityCard/OpportunityCard';
import { Loading } from '../../components/core';
import CardFilter from '../../components/core/card-filter/CardFilter';
import {
  entityTagsValueGetter,
  entityValueGetter,
} from '../../components/core/card-filter/value-getters/entity-value-getter';
import ErrorBlock from '../../components/core/ErrorBlock';
import { ChallengeContainerEntities, ChallengeContainerState } from '../../containers/challenge/ChallengePageContainer';
import { useChallenge } from '../../hooks';
import { Opportunity } from '../../models/graphql-schema';
import { CardLayoutContainer, CardLayoutItem } from '../../components/core/CardLayoutContainer/CardLayoutContainer';

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
          <CardLayoutContainer>
            {filteredData.map((opp, i) => (
              <CardLayoutItem key={i}>
                <OpportunityCard opportunity={opp} ecoverseNameId={ecoverseNameId} challengeNameId={challengeNameId} />
              </CardLayoutItem>
            ))}
          </CardLayoutContainer>
        )}
      </CardFilter>
    </>
  );
};
