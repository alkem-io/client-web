import { useState, ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import ContributorsSearchContainer from '../contributor/ContributorsSearch/ContributorsSearchContainer';
import { InputAdornment, OutlinedInput } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { debounce } from 'lodash';
import { useUserContext } from './';
import ContributorsView, { ITEMS_PER_PAGE } from './ContributorsView';
import TopLevelPageLayout from '@/main/ui/layout/topLevelPageLayout/TopLevelPageLayout';
import PageContentColumn from '@/core/ui/content/PageContentColumn';
import PageContentBlockSeamless from '@/core/ui/content/PageContentBlockSeamless';
import useInnovationHubOutsideRibbon from '@/domain/innovationHub/InnovationHubOutsideRibbon/useInnovationHubOutsideRibbon';
import { GroupOutlined } from '@mui/icons-material';
import TopLevelPageBreadcrumbs from '@/main/topLevelPages/topLevelPageBreadcrumbs/TopLevelPageBreadcrumbs';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import BreadcrumbsItem from '@/core/ui/navigation/BreadcrumbsItem';

const ContributorsPage = () => {
  const { t } = useTranslation();

  // temporary disable the search (server #4545)
  const [searchEnabled] = useState(false);

  const [searchTerms, setSearchTerms] = useState('');
  const [searchTermsDebounced, setSearchTermsDebounced] = useState('');

  const { isAuthenticated } = useUserContext();

  const onSearchHandlerDebounced = debounce((value: string) => setSearchTermsDebounced(value), 500);

  const onSearchHandler = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchTerms(e.target.value);
    onSearchHandlerDebounced(e.target.value);
  };

  const ribbon = useInnovationHubOutsideRibbon({ label: 'innovationHub.outsideOfSpace.contributors' });

  return (
    <TopLevelPageLayout
      title={t('pages.contributors.search.title')}
      subtitle={t('pages.contributors.search.subtitle')}
      iconComponent={GroupOutlined}
      ribbon={ribbon}
      breadcrumbs={
        <TopLevelPageBreadcrumbs>
          <BreadcrumbsItem uri="/contributors" iconComponent={GroupOutlinedIcon}>
            {t('pages.contributors.shortName')}
          </BreadcrumbsItem>
        </TopLevelPageBreadcrumbs>
      }
    >
      <PageContentColumn columns={12}>
        {searchEnabled && (
          <PageContentBlockSeamless disablePadding>
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
        )}
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
    </TopLevelPageLayout>
  );
};

export default ContributorsPage;
