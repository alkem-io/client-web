import Grid from '@mui/material/Grid';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ChallengeExplorerContainerEntities,
  ChallengeExplorerContainerState,
} from '../containers/ChallengeExplorerContainer';
import ChallengeExplorerHeader from './ChallengeExplorer/ChallengeExplorerHeader';
import ChallengeExplorerSearchView, {
  ChallengeExplorerGroupByType,
} from './ChallengeExplorer/ChallengeExplorerSearchView';
import ChallengeExplorerListView from './ChallengeExplorer/ChallengeExplorerListView';

export interface ChallengeExplorerViewProps
  extends ChallengeExplorerContainerEntities,
    ChallengeExplorerContainerState {
  setSearchTerms: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ChallengeExplorerView: FC<ChallengeExplorerViewProps> = ({
  isAuthenticated,
  searchTerms,
  setSearchTerms,
  myChallenges,
  otherChallenges,
  searchResults,
  loading,
  loadingSearch,
}) => {
  const { t } = useTranslation();
  const [groupBy] = useState<ChallengeExplorerGroupByType>('hub');

  if (loading) return null;

  return (
    <>
      <Grid container rowSpacing={2}>
        {/* PUBLIC: Header if not logged in */}
        {!isAuthenticated && (
          <Grid item xs={12}>
            <ChallengeExplorerHeader searchTerms={searchTerms} onSearchTermsChange={setSearchTerms} />
          </Grid>
        )}
        {/* PRIVATE: My Challenges container */}
        {myChallenges && myChallenges.length > 0 && (
          <Grid item xs={12}>
            <ChallengeExplorerListView
              headerText={t('pages.challenge-explorer.my.title')}
              headerCounter={myChallenges.length}
              subHeaderText={t('pages.challenge-explorer.my.subtitle')}
              challenges={myChallenges}
            />
          </Grid>
        )}
        {/* PRIVATE: Other challenges within my hubs */}
        {otherChallenges && otherChallenges.length > 0 && (
          <Grid item xs={12}>
            <ChallengeExplorerListView
              headerText={t('pages.challenge-explorer.other.title')}
              headerCounter={otherChallenges.length}
              subHeaderText={t('pages.challenge-explorer.other.subtitle')}
              challenges={otherChallenges}
              enableFilterByHub
            />
          </Grid>
        )}
        {/* PRIVATE: Header for the public hubs if user is logged in */}
        {isAuthenticated && (
          <Grid item xs={12}>
            <ChallengeExplorerHeader searchTerms={searchTerms} onSearchTermsChange={setSearchTerms} isAuthenticated />
          </Grid>
        )}
        {/* PUBLIC: Search challenges in public hubs/hubs that the user has access to: */}
        <Grid item xs={12}>
          <ChallengeExplorerSearchView
            challenges={searchResults}
            groupBy={groupBy}
            searchTerms={searchTerms}
            loading={loadingSearch}
          />
        </Grid>
      </Grid>
    </>
  );
};
