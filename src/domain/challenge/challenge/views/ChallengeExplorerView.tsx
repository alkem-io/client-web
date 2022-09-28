import { Box } from '@mui/material';
import Grid from '@mui/material/Grid';
import React, { FC, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ChallengeCard from '../../../../common/components/composite/common/cards/ChallengeCard/ChallengeCard';
import { ChallengeCardContainer } from '../../../../containers/challenge/ChallengeCardContainer';
import HubChallengesContainer from '../containers/HubChallengesContainer';
import DashboardGenericSection from '../../../shared/components/DashboardSections/DashboardGenericSection';
import CardsLayout, { CardLayoutContainer } from '../../../shared/layout/CardsLayout/CardsLayout';
import CardsLayoutScroller from '../../../shared/layout/CardsLayout/CardsLayoutScroller';
import {
  ChallengeExplorerContainerEntities,
  ChallengeExplorerContainerState,
  SimpleChallenge,
} from '../containers/ChallengeExplorerContainer';
import ChallengeExplorerHeader from './ChallengeExplorer/ChallengeExplorerHeader';
import ChallengeExplorerSearchView, {
  ChallengeExplorerGroupByType,
} from './ChallengeExplorer/ChallengeExplorerSearchView';
import { Challenge } from '../../../../models/graphql-schema';
import { SearchChallengeCard } from '../../../shared/components/search-cards';
import { getVisualBannerNarrow } from '../../../../common/utils/visuals.utils';
import { buildChallengeUrl } from '../../../../common/utils/urlBuilders';
import { useUserContext } from '../../../../hooks';
import { RoleType } from '../../../community/contributor/user/constants/RoleType';
import CardsLayoutFilterContainer from '../../../shared/layout/CardsLayout/CardsLayoutFilterContainer';

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
  loading,
}) => {
  const { t } = useTranslation();
  const { user } = useUserContext();
  const [groupBy] = useState<ChallengeExplorerGroupByType>('hub');

  const filterUserChallenges = useCallback(
    (challenge: Challenge) => {
      return userChallenges?.find(userChallenge => userChallenge.id === challenge.id) === undefined;
    },
    [userChallenges]
  );

  const getCardLabel = useCallback(
    (roles: string[]) => {
      return roles.find(r => r === RoleType.Lead) || roles.find(r => r === RoleType.Member);
    },
    [user]
  );

  const filterChallenges = (item: SimpleChallenge, index: number, allItems: SimpleChallenge[], filterValue: string) => {
    return item.displayName.indexOf(filterValue) > -1 || item.hubDisplayName.indexOf(filterValue) > -1;
  };

  if (loading) return null;

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
              <CardsLayoutFilterContainer items={userChallenges} filter={filterChallenges}>
                {({ filteredItems: filteredUserChallenges }) => (
                  <CardsLayoutScroller maxHeight={42} sx={{ marginRight: 0 }}>
                    <CardsLayout items={filteredUserChallenges}>
                      {({ hubNameId, hubDisplayName, id: challengeId, roles, matchedTerms }) => (
                        // TODO move data enrichment to an enhanced version of BetterCardLayoutContainer
                        // then, within this function, just render a normal ChallengeCard
                        <ChallengeCardContainer hubNameId={hubNameId} challengeNameId={challengeId}>
                          {({ challenge }) =>
                            challenge && (
                              <SearchChallengeCard
                                name={challenge.displayName}
                                tagline={challenge.context?.tagline}
                                image={getVisualBannerNarrow(challenge.context?.visuals)}
                                matchedTerms={matchedTerms}
                                label={getCardLabel(roles)}
                                url={buildChallengeUrl(hubNameId, challenge.nameID)}
                                parentName={hubDisplayName}
                              />
                            )
                          }
                        </ChallengeCardContainer>
                      )}
                    </CardsLayout>
                  </CardsLayoutScroller>
                )}
              </CardsLayoutFilterContainer>
            </DashboardGenericSection>
          </Grid>
        )}
        {/* PRIVATE: Other challenges within my hubs */}
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
                      {({ challenges: challengesInHub }) => (
                        <>
                          {challengesInHub.filter(filterUserChallenges).map(challenge => (
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
