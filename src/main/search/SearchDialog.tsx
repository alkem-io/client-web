import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { SEARCH_TERMS_URL_PARAM } from './constants';
import SearchView from './SearchView';
import { spaceFilterConfig } from './Filter';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { DialogContent } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useTransactionScope } from '@/core/analytics/SentryTransactionScopeContext';
import useNavigate from '@/core/routing/useNavigate';

const SearchDialog = () => {
  const { pathname } = useLocation();

  const queryParams = useQueryParams();

  const isSearchDialogOpen = queryParams.has(SEARCH_TERMS_URL_PARAM);

  useTransactionScope({ type: 'connect(search)' }, { skip: !isSearchDialogOpen });

  const navigate = useNavigate();

  const handleClose = () => {
    navigate(pathname, { replace: true });
  };

  const { t } = useTranslation();

  return (
    <DialogWithGrid open={isSearchDialogOpen} columns={12} aria-labelledby="search-dialog" onClose={handleClose}>
      <DialogHeader
        id="search-dialog"
        icon={<Search />}
        title={t('components.searchDialog.headerTitle')}
        onClose={handleClose}
      />

      <DialogContent sx={{ paddingTop: 0, scrollBehavior: 'smooth' }}>
        <SearchView
          searchRoute={pathname}
          spaceFilterConfig={spaceFilterConfig}
          spaceFilterTitle={t('pages.search.spaceFilterTitle')}
        />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default SearchDialog;
