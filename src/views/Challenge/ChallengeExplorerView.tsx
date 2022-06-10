import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion } from '../../components/composite/common/Accordion/Accordion';
import SearchTagsInput from '../../domain/shared/components/SearchTagsInput/SearchTagsInput';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import { ChallengeCardContainer } from '../../containers/challenge/ChallengeCardContainer';
import HubChallengesContainer from '../../containers/hub/HubChallengesContainer';
import ChallengeExplorerSearchView, {
  ChallengeExplorerGroupByType,
} from './ChallengeExplorer/ChallengeExplorerSearchView';
import ChallengeCard from '../../components/composite/common/cards/ChallengeCard/ChallengeCard';
import CardsLayout from '../../domain/shared/layout/CardsLayout/CardsLayout';

export interface HubOverview {
  hubID: string;
  nameID: string;
  displayName: string;
}

interface ChallengeOverview {
  id: string;
  hubId: string;
  hubNameId: string;
}

export interface ChallengeExplorerViewProps {
  myChallenges?: ChallengeOverview[];
  hubs?: HubOverview[];
}

export const ChallengeExplorerView: FC<ChallengeExplorerViewProps> = ({ myChallenges, hubs }) => {
  const { t } = useTranslation();
  const [groupBy] = useState<ChallengeExplorerGroupByType>('hub');
  const [searchTerms, setSearchTerms] = useState<string[]>([]);

  const onSearchHandler = (_e: unknown, terms: string[]) => setSearchTerms(terms);

  return (
    <Box paddingY={2}>
      <Grid container rowSpacing={4}>
        {myChallenges && (
          <Grid item xs={12}>
            <Accordion
              title={t('pages.challenge-explorer.my.title', { count: myChallenges.length })}
              subtitle={t('pages.challenge-explorer.my.subtitle')}
              helpText={t('pages.challenge-explorer.my.help-text')}
              ariaKey="my-challenges"
            >
              <CardsLayout items={myChallenges}>
                {({ hubNameId, id: challengeId }) => (
                  // TODO move data enrichment to an enhanced version of BetterCardLayoutContainer
                  // then, within this function, just render a normal ChallengeCard
                  <ChallengeCardContainer hubNameId={hubNameId} challengeNameId={challengeId}>
                    {({ challenge }) => challenge && <ChallengeCard challenge={challenge} hubNameId={hubNameId} />}
                  </ChallengeCardContainer>
                )}
              </CardsLayout>
            </Accordion>
          </Grid>
        )}
        <Grid item xs={12}>
          <DashboardGenericSection
            headerText={t('pages.challenge-explorer.search.title')}
            subHeaderText={t('pages.challenge-explorer.search.subtitle')}
          >
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <SearchTagsInput
                  value={searchTerms}
                  placeholder={t('pages.challenge-explorer.search.placeholder')}
                  onChange={onSearchHandler}
                />
              </Grid>
            </Grid>
          </DashboardGenericSection>
        </Grid>
        <Grid item xs={12}>
          <Box paddingTop={2}>
            <ChallengeExplorerSearchView terms={searchTerms} groupBy={groupBy} />
          </Box>
        </Grid>
        {hubs &&
          hubs.map(({ displayName: hubName, nameID: hubNameId }, i) => (
            <HubChallengesContainer
              key={i}
              entities={{
                hubNameId: hubNameId,
              }}
            >
              {cEntities => (
                <Grid item xs={12}>
                  <Accordion
                    title={t('pages.challenge-explorer.hubs.title', {
                      count: cEntities.challenges.length,
                      name: hubName,
                    })}
                    subtitle={t('pages.challenge-explorer.hubs.subtitle', { name: hubName })}
                    helpText={t('pages.challenge-explorer.hubs.help-text')}
                    ariaKey={hubName}
                  >
                    <CardsLayout items={cEntities.challenges} deps={[hubNameId]}>
                      {challenge => <ChallengeCard challenge={challenge} hubNameId={hubNameId} />}
                    </CardsLayout>
                  </Accordion>
                </Grid>
              )}
            </HubChallengesContainer>
          ))}
      </Grid>
    </Box>
  );
};
