import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { ChallengesPanelView } from './ChallengesPanelView';
import { Box } from '@mui/material';
import EcoverseChallengesContainer from '../../containers/ecoverse/EcoverseChallengesContainer';
import Grid from '@mui/material/Grid';

export interface HubOverview {
  id: string;
  nameID: string;
  displayName: string;
}

interface ChallengeOverview {
  id: string;
  ecoverseId: string;
}

export interface ChallengesOverviewViewProps {
  myChallenges: ChallengeOverview[];
  hubs: HubOverview[];
}

export const ChallengesOverviewView: FC<ChallengesOverviewViewProps> = ({ myChallenges, hubs }) => {
  const { t } = useTranslation();
  return (
    <Box paddingY={2}>
      <Grid container rowSpacing={4}>
        <Grid item xs={12}>
          {myChallenges.map(x => null
            // todo provide the view with the challenge card data like below
            /*<ChallengesOverviewHubView
              title={t('pages.challenges-overview.my.title', { count: my.length })}
              subtitle={t('pages.challenges-overview.my.subtitle')}
              helpText={t('pages.challenges-overview.my.help-text')}
              ariaKey="my"
              challenges={my}
            />*/
          )}

        </Grid>
        {hubs.map(({ displayName: hubName, nameID }, i) => {
          return (
            <EcoverseChallengesContainer
              key={i}
              entities={{
                ecoverseNameId: nameID,
              }}
            >
              {(cEntities) => {
                const challenges = cEntities.challenges;
                return (
                  <Grid item xs={12}>
                    <ChallengesPanelView
                      title={t('pages.challenges-overview.hubs.title', { count: challenges.length, name: hubName })}
                      subtitle={t('pages.challenges-overview.hubs.subtitle', { name: hubName })}
                      helpText={t('pages.challenges-overview.hubs.help-text')}
                      ariaKey={hubName}
                      challenges={challenges}
                    />
                  </Grid>
                )
              }}
            </EcoverseChallengesContainer>
          );
        })}
      </Grid>
    </Box>
  );
};
