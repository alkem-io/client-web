import Grid from '@mui/material/Grid';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ChallengeExplorerContainerEntities, ChallengeExplorerContainerState } from './ChallengeExplorerContainer';
import ChallengeExplorerHeader from '../../../domain/journey/challenge/views/ChallengeExplorer/ChallengeExplorerHeader';
import ChallengeExplorerSearchView, {
  ChallengeExplorerGroupByType,
} from '../../../domain/journey/challenge/views/ChallengeExplorer/ChallengeExplorerSearchView';
import ChallengeExplorerListView from '../../../domain/journey/challenge/views/ChallengeExplorer/ChallengeExplorerListView';

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
  const [groupBy] = useState<ChallengeExplorerGroupByType>('space');

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
              challenges={myChallenges}
            />
          </Grid>
        )}
        {/* PRIVATE: Other challenges within my spaces */}
        {otherChallenges && otherChallenges.length > 0 && (
          <Grid item xs={12}>
            <ChallengeExplorerListView
              headerText={t('pages.challenge-explorer.other.title')}
              headerCounter={otherChallenges.length}
              challenges={otherChallenges}
              enableFilterBySpace
            />
          </Grid>
        )}
        {/* PRIVATE: Header for the public spaces if user is logged in */}
        {isAuthenticated && (
          <Grid item xs={12}>
            <ChallengeExplorerHeader searchTerms={searchTerms} onSearchTermsChange={setSearchTerms} isAuthenticated />
          </Grid>
        )}
        {/* PUBLIC: Search challenges in public spaces/spaces that the user has access to: */}
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
