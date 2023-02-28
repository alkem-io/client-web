import TopLevelDesktopLayout from '../../../../core/ui/layout/TopLevel/TopLevelDesktopLayout';
import SearchView from '../../search/SearchView';
import { SEARCH_ROUTE } from '../../routes/constants';
import { journeyFilterConfig } from './Filter';
import { useTranslation } from 'react-i18next';

const SearchPage = () => {
  const { t } = useTranslation();

  return (
    <TopLevelDesktopLayout>
      <SearchView
        searchRoute={SEARCH_ROUTE}
        journeyFilterConfig={journeyFilterConfig}
        journeyFilterTitle={t('pages.search.journeyFilterTitle')}
      />
    </TopLevelDesktopLayout>
  );
};

export default SearchPage;
