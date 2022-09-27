import { Grid, Typography } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import SideNote from '../../../../shared/components/SideNote';
import SearchTagsInput from '../../../../shared/components/SearchTagsInput/SearchTagsInput';
import SectionSpacer from '../../../../shared/components/Section/SectionSpacer';

export interface ChallengeExplorerHeaderProps {
  isLoggedIn: boolean;
  searchTerms: string[];
  onSearchTermsChange: (searchTerms: string[]) => void;
}

const ChallengeExplorerHeader: FC<ChallengeExplorerHeaderProps> = ({
  searchTerms,
  isLoggedIn,
  onSearchTermsChange,
}) => {
  const { t } = useTranslation();

  return (
    <Grid container spacing={2}>
      {isLoggedIn && (
        <Grid item xs={12}>
          <Typography variant="h2">{t('pages.challenge-explorer.my-search.title')}</Typography>
          <Typography>{t('pages.challenge-explorer.my-search.subtitle')}</Typography>
          <SectionSpacer double />
          <SearchTagsInput
            value={searchTerms}
            placeholder={t('pages.challenge-explorer.search.placeholder')}
            onChange={(_event: unknown, newValue: string[]) => onSearchTermsChange(newValue)}
          />
        </Grid>
      )}
      {!isLoggedIn && (
        <>
          <Grid item xs={12} md={8}>
            <Typography variant="h2">{t('pages.challenge-explorer.search.title')}</Typography>
            <Typography>{t('pages.challenge-explorer.search.subtitle')}</Typography>
            <SectionSpacer double />
            <SearchTagsInput
              value={searchTerms}
              placeholder={t('pages.challenge-explorer.search.placeholder')}
              onChange={(_event: unknown, newValue: string[]) => onSearchTermsChange(newValue)}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <SideNote
              title={t('pages.challenge-explorer.side-note.title')}
              description={t('pages.challenge-explorer.side-note.description')}
            />
          </Grid>
        </>
      )}
    </Grid>
  );
};

export default ChallengeExplorerHeader;
