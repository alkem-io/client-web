import Box from '@mui/material/Box';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContributorsSearchContainer from './ContributorsSearch/ContributorsSearchContainer';
import { useUpdateNavigation, useUserContext } from '../../hooks';
import ContributorsView, { ITEMS_PER_PAGE } from '../../views/Contributors/ContributorsView';
import { InputAdornment, OutlinedInput, Typography } from '@mui/material';
import SectionSpacer from '../../domain/shared/components/Section/SectionSpacer';
import SearchIcon from '@mui/icons-material/Search';

export interface ContributorsPageProps {}

const currentPaths = [];
const ContributorsPage: FC<ContributorsPageProps> = () => {
  const { t } = useTranslation();

  useUpdateNavigation({ currentPaths });
  const [searchTerms, setSearchTerms] = useState<string>('');

  const { isAuthenticated } = useUserContext();

  const onSearchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerms(e.target.value);
  };

  return (
    <Box paddingY={2}>
      <Typography variant="h1">{t('pages.contributors.search.title')}</Typography>
      <Typography>{t('pages.contributors.search.subtitle')}</Typography>
      <SectionSpacer double />
      <OutlinedInput
        value={searchTerms}
        sx={{ width: '100%' }}
        placeholder={t('components.searchableList.placeholder')}
        onChange={onSearchHandler}
        endAdornment={
          <InputAdornment position="end">
            <SearchIcon />
          </InputAdornment>
        }
      />
      <ContributorsSearchContainer searchTerms={searchTerms} pageSize={ITEMS_PER_PAGE}>
        {({ users, organizations }) => {
          return (
            <ContributorsView
              usersPaginated={users}
              showUsers={isAuthenticated}
              organizationsPaginated={organizations}
            />
          );
        }}
      </ContributorsSearchContainer>
    </Box>
  );
};
export default ContributorsPage;
