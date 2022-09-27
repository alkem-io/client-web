import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChallengeCard from '../../../../common/components/composite/common/cards/ChallengeCard/ChallengeCard';
import { ChallengeCardContainer } from '../../../../containers/challenge/ChallengeCardContainer';
import HubChallengesContainer from '../../../../containers/hub/HubChallengesContainer';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import CardsLayout, { CardLayoutContainer } from '../../../shared/layout/CardsLayout/CardsLayout';
import CardsLayoutScroller from '../../../shared/layout/CardsLayout/CardsLayoutScroller';
import {
  ChallengeExplorerContainerEntities,
  ChallengeExplorerContainerState,
} from '../containers/ChallengeExplorerContainer';
import ChallengeExplorerHeader from './ChallengeExplorer/ChallengeExplorerHeader';
import ChallengeExplorerSearchView, {
  ChallengeExplorerGroupByType,
} from './ChallengeExplorer/ChallengeExplorerSearchView';

export interface ChallengeExplorerViewProps
  extends ChallengeExplorerContainerEntities,
    ChallengeExplorerContainerState {
  setSearchTerms: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ChallengeExplorerView: FC<ChallengeExplorerViewProps> = ({
  isLoggedIn,
  searchTerms,
  setSearchTerms,
  userChallenges,
  userHubs,
  searchResults,
}) => {
  const { t } = useTranslation();
  const [groupBy] = useState<ChallengeExplorerGroupByType>('hub');

  return (
    <Box paddingY={2} marginTop={2}>
      <Grid container rowSpacing={4}>
        {/* PUBLIC: Header if not logged in */}
        {!isLoggedIn && (
          <Grid item>
            <ChallengeExplorerHeader
              searchTerms={searchTerms}
              onSearchTermsChange={setSearchTerms}
              isLoggedIn={isLoggedIn}
            />
          </Grid>
        )}
        {/* PRIVATE: My Challenges container */}
        {userChallenges && (
          <Grid item xs={12}>
            <DashboardGenericSection
              headerText={t('pages.challenge-explorer.my.title')}
              headerCounter={userChallenges.length}
              subHeaderText={t('pages.challenge-explorer.my.subtitle')}
            >
              {/* TODO FILTER HERE */}
              <CardsLayoutScroller maxHeight={42} sx={{ marginRight: 0 }}>
                <CardsLayout items={userChallenges}>
                  {({ hubNameId, id: challengeId }) => (
                    // TODO move data enrichment to an enhanced version of BetterCardLayoutContainer
                    // then, within this function, just render a normal ChallengeCard
                    <ChallengeCardContainer hubNameId={hubNameId} challengeNameId={challengeId}>
                      {({ challenge }) => challenge && <ChallengeCard challenge={challenge} hubNameId={hubNameId} />}
                    </ChallengeCardContainer>
                  )}
                </CardsLayout>
              </CardsLayoutScroller>
            </DashboardGenericSection>
          </Grid>
        )}
        {/* PRIVATE: Challenges within my hubs */}
        {userHubs && userHubs.length > 0 && (
          <Grid item xs={12}>
            {/* TODO: Make this counter work */}
            <DashboardGenericSection
              headerText={t('pages.challenge-explorer.other.title')}
              headerCounter={undefined}
              subHeaderText={t('pages.challenge-explorer.other.subtitle')}
            >
              <CardsLayoutScroller maxHeight={42} sx={{ marginRight: 0 }}>
                <CardLayoutContainer>
                  {userHubs.map(hub => (
                    <HubChallengesContainer
                      key={hub.hubID}
                      entities={{
                        hubNameId: hub.nameID,
                      }}
                    >
                      {cEntities => (
                        <>
                          {cEntities.challenges.map(challenge => (
                            <ChallengeCard challenge={challenge} hubNameId={hub.nameID} />
                          ))}
                        </>
                      )}
                    </HubChallengesContainer>
                  ))}
                </CardLayoutContainer>
              </CardsLayoutScroller>
            </DashboardGenericSection>
          </Grid>
        )}
        {/* PRIVATE: Header for the public hubs if user is logged in */}
        {isLoggedIn && (
          <Grid item>
            <ChallengeExplorerHeader
              searchTerms={searchTerms}
              onSearchTermsChange={setSearchTerms}
              isLoggedIn={isLoggedIn}
            />
          </Grid>
        )}
        {/* PUBLIC: Search challenges in public hubs/hubs that the user has access to */}
        <Grid item xs={12}>
          <Box paddingTop={2}>
            <ChallengeExplorerSearchView challenges={searchResults} groupBy={groupBy} />
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
};
