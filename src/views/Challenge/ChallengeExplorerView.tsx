import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Accordion } from '../../components/composite/common/Accordion/Accordion';
import SearchComponent from '../../components/composite/common/SearchComponent/SearchComponent';
import DashboardGenericSection from '../../components/composite/common/sections/DashboardGenericSection';
import { ChallengeCardContainer } from '../../containers/challenge/ChallengeCardContainer';
import HubChallengesContainer from '../../containers/hub/HubChallengesContainer';
import ChallengeExplorerSearchView, {
  ChallengeExplorerGroupByType,
} from './ChallengeExplorer/ChallengeExplorerSearchView';
import ChallengeCard from '../../components/composite/common/cards/ChallengeCard/ChallengeCard';
import { CardLayoutContainer, CardLayoutItem } from '../../components/core/CardLayoutContainer/CardLayoutContainer';

// const groupByOptions = [
//   {
//     label: 'Hub',
//     value: 'hub',
//   },
// ];

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

  const onSearchHandler = (terms: string[]) => setSearchTerms(terms);

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
              <CardLayoutContainer>
                {myChallenges.map(({ hubNameId, id: challengeId }, i) => (
                  <ChallengeCardContainer key={i} hubNameId={hubNameId} challengeNameId={challengeId}>
                    {({ challenge }) =>
                      challenge && (
                        <CardLayoutItem>
                          <ChallengeCard challenge={challenge} hubNameId={hubNameId} />
                        </CardLayoutItem>
                      )
                    }
                  </ChallengeCardContainer>
                ))}
              </CardLayoutContainer>
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
                <SearchComponent
                  placeholder={t('pages.challenge-explorer.search.placeholder')}
                  onChange={onSearchHandler}
                />
              </Grid>
              {/* <Grid item xs={2}>
                <FormControl fullWidth>
                  <InputLabel id="demo-simple-select-label">Group by</InputLabel>
                  <Select
                    labelId="demo-simple-select-label"
                    id="demo-simple-select"
                    value={groupBy}
                    label="Group by"
                    onChange={e => setGroupBy(e.target.value as ChallengeExplorerGroupByType)}
                  >
                    {groupByOptions.map(({ label, value }, i) => (
                      <MenuItem key={i} value={value} disabled={true}>
                        {label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid> */}
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
                    <CardLayoutContainer>
                      {cEntities.challenges.map((challenge, i) => (
                        <CardLayoutItem key={i}>
                          <ChallengeCard challenge={challenge} hubNameId={hubNameId} />
                        </CardLayoutItem>
                      ))}
                    </CardLayoutContainer>
                  </Accordion>
                </Grid>
              )}
            </HubChallengesContainer>
          ))}
      </Grid>
    </Box>
  );
};
