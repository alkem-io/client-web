import TopLevelDesktopLayout from '../ui/PageLayout/TopLevelDesktopLayout';
import SearchView from './SearchView';
import { SEARCH_ROUTE } from '../routes/constants';
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
