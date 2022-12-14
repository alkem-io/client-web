import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import OpportunityCard from '../../../../common/components/composite/common/cards/OpportunityCard/OpportunityCard';
import { Loading } from '../../../../common/components/core';
import CardFilter from '../../../../common/components/core/card-filter/CardFilter';
import {
  entityTagsValueGetter,
  entityValueGetter,
} from '../../../../common/components/core/card-filter/value-getters/entity-value-getter';
import ErrorBlock from '../../../../common/components/core/ErrorBlock';
import { OpportunityIcon } from '../../../shared/icons/OpportunityIcon';
import { buildOpportunityUrl } from '../../../../common/utils/urlBuilders';
import { Opportunity } from '../../../../core/apollo/generated/graphql-schema';
import PageContent from '../../../../core/ui/content/PageContent';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import PageContentColumn from '../../../../core/ui/content/PageContentColumn';
import LinksList from '../../../../core/ui/list/LinksList';
import CardsLayout from '../../../shared/layout/CardsLayout/CardsLayout';
import { ChallengeContainerEntities, ChallengeContainerState } from '../containers/ChallengePageContainer';
import { useChallenge } from '../hooks/useChallenge';

interface ChallengeOpportunitiesViewProps {
  entities: ChallengeContainerEntities;
  state: ChallengeContainerState;
}

export const ChallengeOpportunitiesView: FC<ChallengeOpportunitiesViewProps> = ({ entities, state }) => {
  const { t } = useTranslation();
  const opportunities = (entities.challenge?.opportunities ?? []) as Opportunity[];

  const { hubNameId, challengeNameId, loading: loadingChallengeContext } = useChallenge();

  if (loadingChallengeContext || state.loading) return <Loading />;

  if (state.error) {
    return (
      <Box display="flex" justifyContent="center">
        <ErrorBlock blockName={t('common.opportunities')} />
      </Box>
    );
  }

  return (
    <PageContent>
      <PageContentColumn columns={4}>
        <PageContentBlock>
          <PageContentBlockHeader
            title={t('pages.generic.sections.subentities.list', { entities: t('common.opportunities') })}
          />
          <LinksList
            items={opportunities.map(opportunity => ({
              title: opportunity.displayName,
              url: buildOpportunityUrl(hubNameId, challengeNameId, opportunity.nameID),
              icon: <OpportunityIcon />,
            }))}
          />
        </PageContentBlock>
      </PageContentColumn>

      <PageContentColumn columns={8}>
        {!state.loading && !opportunities.length ? (
          <Box paddingBottom={2} display="flex" justifyContent="center">
            <Typography>{t('pages.challenge.sections.opportunities.body-missing')}</Typography>
          </Box>
        ) : (
          <CardFilter data={opportunities} tagsValueGetter={entityTagsValueGetter} valueGetter={entityValueGetter}>
            {filteredData => (
              <CardsLayout items={state.loading ? [undefined, undefined] : filteredData} deps={[hubNameId]}>
                {opp =>
                  opp ? (
                    <OpportunityCard opportunity={opp} hubNameId={hubNameId} challengeNameId={challengeNameId} />
                  ) : (
                    <></>
                  )
                }
              </CardsLayout>
            )}
          </CardFilter>
        )}
      </PageContentColumn>
    </PageContent>
  );
};
