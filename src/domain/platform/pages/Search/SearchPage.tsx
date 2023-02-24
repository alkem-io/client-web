import TopLevelDesktopLayout from '../../../../core/ui/layout/TopLevel/TopLevelDesktopLayout';
import SearchView from '../../search/SearchView';
import { SEARCH_ROUTE } from '../../routes/constants';

const SearchPage = () => {
  return (
    <TopLevelDesktopLayout>
      <SearchView searchRoute={SEARCH_ROUTE} />
    </TopLevelDesktopLayout>
  );
};

export default SearchPage;
