import TopLevelPageLayout from '../../../main/ui/layout/topLevelPageLayout/TopLevelPageLayout';
import SearchView from './SearchView';
import { SEARCH_ROUTE } from '../routes/constants';
import { journeyFilterConfig } from './Filter';
import { useTranslation } from 'react-i18next';
import { SearchOutlined } from '@mui/icons-material';

const SearchPage = () => {
  const { t } = useTranslation();

  return (
    <TopLevelPageLayout
      title={t('pages.search.title')}
      subtitle={t('pages.search.subtitle')}
      iconComponent={SearchOutlined}
    >
      <SearchView
        searchRoute={SEARCH_ROUTE}
        journeyFilterConfig={journeyFilterConfig}
        journeyFilterTitle={t('pages.search.journeyFilterTitle')}
      />
    </TopLevelPageLayout>
  );
};

export default SearchPage;
