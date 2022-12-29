import Box from '@mui/material/Box';
import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContributorsSearchContainer from './ContributorsSearch/ContributorsSearchContainer';
import { InputAdornment, OutlinedInput } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';
import { useUserContext } from './user';
import { useUpdateNavigation } from '../../../core/routing/useNavigation';
import ContributorsView, { ITEMS_PER_PAGE } from './ContributorsView';
import SectionSpacer from '../../shared/components/Section/SectionSpacer';
import TopLevelDesktopLayout from '../../shared/layout/LegacyPageLayout/TopLevelDesktopLayout';
import { PageTitle, Text } from '../../../core/ui/typography';

export interface ContributorsPageProps {}

const currentPaths = [];
const ContributorsPage: FC<ContributorsPageProps> = () => {
  const { t } = useTranslation();

  useUpdateNavigation({ currentPaths });
  const [searchTerms, setSearchTerms] = useState<string>('');
  const [searchTermsDebounced, setSearchTermsDebounced] = useState<string>('');

  const { isAuthenticated } = useUserContext();

  const onSearchHandlerDebounced = debounce((value: string) => setSearchTermsDebounced(value), 500);

  const onSearchHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerms(e.target.value);
    onSearchHandlerDebounced(e.target.value);
  };

  return (
    <TopLevelDesktopLayout>
      <Box paddingY={2} marginTop={2}>
        <PageTitle>{t('pages.contributors.search.title')}</PageTitle>
        <Text>{t('pages.contributors.search.subtitle')}</Text>
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
        <ContributorsSearchContainer searchTerms={searchTermsDebounced} pageSize={ITEMS_PER_PAGE}>
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
    </TopLevelDesktopLayout>
  );
};

export default ContributorsPage;
