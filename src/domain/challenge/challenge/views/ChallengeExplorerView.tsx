import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChallengeCard from '../../../../common/components/composite/common/cards/ChallengeCard/ChallengeCard';
import { HubIcon } from '../../../../common/icons/HubIcon';
import { ChallengeCardContainer } from '../../../../containers/challenge/ChallengeCardContainer';
import HubChallengesContainer from '../../../../containers/hub/HubChallengesContainer';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import CardsLayout from '../../../shared/layout/CardsLayout/CardsLayout';
import { ChallengeExplorerContainerEntities, ChallengeExplorerContainerState } from '../containers/ChallengeExplorerContainer';
import ChallengeExplorerHeader from './ChallengeExplorer/ChallengeExplorerHeader';
import ChallengeExplorerSearchView, {
  ChallengeExplorerGroupByType,
} from './ChallengeExplorer/ChallengeExplorerSearchView';

/*
export interface HubOverview {
  hubID: string;
  nameID: string;
  displayName: string;
  tagline?: string;
}

interface ChallengeOverview {
  id: string;
  hubId: string;
  hubNameId: string;
}
*/
export interface ChallengeExplorerViewProps extends ChallengeExplorerContainerEntities, ChallengeExplorerContainerState {
  setSearchTerms: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ChallengeExplorerView: FC<ChallengeExplorerViewProps> = ({
  _isLoggedIn,
  searchTerms,
  setSearchTerms,
  userChallenges,
  userHubs,
  publicChallenges,
  _loading  //!!
}) => {
  const { t } = useTranslation();
  const [groupBy] = useState<ChallengeExplorerGroupByType>('hub');

  return (
    <Box paddingY={2}>
      <Grid container rowSpacing={4}>
        <Grid item>
          <ChallengeExplorerHeader searchTerms={searchTerms} onSearchTermsChange={setSearchTerms} />
        </Grid>
        {userChallenges && (
          <Grid item xs={12}>
            <DashboardGenericSection
              headerText={t('pages.challenge-explorer.my.title', { count: userChallenges.length })}
              subHeaderText={t('pages.challenge-explorer.my.subtitle')}
              helpText={t('pages.challenge-explorer.my.help-text')}
            >
              <CardsLayout items={userChallenges}>
                {({ hubNameId, id: challengeId }) => (
                  // TODO move data enrichment to an enhanced version of BetterCardLayoutContainer
                  // then, within this function, just render a normal ChallengeCard
                  <ChallengeCardContainer hubNameId={hubNameId} challengeNameId={challengeId}>
                    {({ challenge }) => challenge && <ChallengeCard challenge={challenge} hubNameId={hubNameId} />}
                  </ChallengeCardContainer>
                )}
              </CardsLayout>
            </DashboardGenericSection>
          </Grid>
        )}
        <Grid item xs={12}>
          <Box paddingTop={2}>
            <ChallengeExplorerSearchView challenges={publicChallenges} groupBy={groupBy} />
          </Box>
        </Grid>
        {userHubs &&
          userHubs.map((hub) => (
            <HubChallengesContainer
              key={hub.hubID}
              entities={{
                hubNameId: hub.nameID,
              }}
            >
              {cEntities => (
                <Grid item xs={12}>
                  <DashboardGenericSection
                    headerText={hub.displayName}
                    headerIcon={<HubIcon />}
                    subHeaderText={hub.displayName + '//!! Tagline'}
                  >
                    <CardsLayout items={cEntities.challenges} deps={[hub.nameID]}>
                      {challenge => <ChallengeCard challenge={challenge} hubNameId={hub.nameID} />}
                    </CardsLayout>
                  </DashboardGenericSection>
                </Grid>
              )}
            </HubChallengesContainer>
          ))}
      </Grid>
    </Box>
  );
};
