import DialogWithGrid from '@core/ui/dialog/DialogWithGrid';
import { useQueryParams } from '@core/routing/useQueryParams';
import { SEARCH_TERMS_URL_PARAM } from './constants';
import SearchView from './SearchView';
import { journeyFilterConfig } from './Filter';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import DialogHeader from '@core/ui/dialog/DialogHeader';
import { DialogContent } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useTransactionScope } from '@core/analytics/SentryTransactionScopeContext';
import useNavigate from '@core/routing/useNavigate';

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
    <DialogWithGrid open={isSearchDialogOpen} columns={12}>
      <DialogHeader icon={<Search />} title={t('components.searchDialog.headerTitle')} onClose={handleClose} />
      <DialogContent>
        <SearchView
          searchRoute={pathname}
          journeyFilterConfig={journeyFilterConfig}
          journeyFilterTitle={t('pages.search.journeyFilterTitle')}
        />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default SearchDialog;
