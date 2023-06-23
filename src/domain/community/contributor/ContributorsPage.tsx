import React, { FC, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ContributorsSearchContainer from './ContributorsSearch/ContributorsSearchContainer';
import { InputAdornment, OutlinedInput } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';
import { useUserContext } from './user';
import { useUpdateNavigation } from '../../../core/routing/useNavigation';
import ContributorsView, { ITEMS_PER_PAGE } from './ContributorsView';
import TopLevelDesktopLayout from '../../platform/ui/PageLayout/TopLevelDesktopLayout';
import { PageTitle, Text } from '../../../core/ui/typography';
import PageContentColumn from '../../../core/ui/content/PageContentColumn';
import PageContentBlockSeamless from '../../../core/ui/content/PageContentBlockSeamless';
import useInnovationHubOutsideRibbon from '../../platform/InnovationHub/InnovationHubOutsideRibbon/useInnovationHubOutsideRibbon';

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

  const ribbon = useInnovationHubOutsideRibbon({ label: 'innovationHub.outsideOfSpace.contributors' });

  return (
    <TopLevelDesktopLayout heading={ribbon}>
      <PageContentColumn columns={12}>
        <PageContentBlockSeamless disablePadding>
          <PageTitle>{t('pages.contributors.search.title')}</PageTitle>
          <Text>{t('pages.contributors.search.subtitle')}</Text>
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
        </PageContentBlockSeamless>
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
      </PageContentColumn>
    </TopLevelDesktopLayout>
  );
};

export default ContributorsPage;
