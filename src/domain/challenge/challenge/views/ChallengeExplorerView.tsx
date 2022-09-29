import { Box } from '@mui/material';
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
import ChallengesList from './ChallengeExplorer/ChallengesList';

export interface ChallengeExplorerViewProps
  extends ChallengeExplorerContainerEntities,
    ChallengeExplorerContainerState {
  setSearchTerms: React.Dispatch<React.SetStateAction<string[]>>;
}

export const ChallengeExplorerView: FC<ChallengeExplorerViewProps> = ({
  isLoggedIn,
  searchTerms,
  setSearchTerms,
  myChallenges,
  otherChallenges,
  searchResults,
  loading,
}) => {
  const { t } = useTranslation();
  const [groupBy] = useState<ChallengeExplorerGroupByType>('hub');

  if (loading) return null;

  return (
    <Box paddingY={2} marginTop={2}>
      <Grid container rowSpacing={4}>
        {/* PUBLIC: Header if not logged in */}
        {!isLoggedIn && (
          <Grid item xs={12}>
            <ChallengeExplorerHeader searchTerms={searchTerms} onSearchTermsChange={setSearchTerms} />
          </Grid>
        )}
        {/* PRIVATE: My Challenges container */}
        {myChallenges && (
          <Grid item xs={12}>
            <ChallengesList
              headerText={t('pages.challenge-explorer.my.title')}
              headerCounter={myChallenges.length}
              subHeaderText={t('pages.challenge-explorer.my.subtitle')}
              challenges={myChallenges}
            />
          </Grid>
        )}
        {/* PRIVATE: Other challenges within my hubs */}
        {otherChallenges && (
          <Grid item xs={12}>
            <ChallengesList
              headerText={t('pages.challenge-explorer.other.title')}
              headerCounter={otherChallenges.length}
              subHeaderText={t('pages.challenge-explorer.other.subtitle')}
              challenges={otherChallenges}
              enableFilterByHub
            />
          </Grid>
        )}
        {/* PRIVATE: Header for the public hubs if user is logged in */}
        {isLoggedIn && (
          <Grid item xs={12}>
            <ChallengeExplorerHeader searchTerms={searchTerms} onSearchTermsChange={setSearchTerms} isLoggedIn />
          </Grid>
        )}
        {/* PUBLIC: Search challenges in public hubs/hubs that the user has access to: */}
        <Grid item xs={12}>
          <ChallengeExplorerSearchView challenges={searchResults} groupBy={groupBy} searchTerms={searchTerms} />
        </Grid>
      </Grid>
    </Box>
  );
};
