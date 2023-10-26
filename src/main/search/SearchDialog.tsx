import DialogWithGrid from '../../core/ui/dialog/DialogWithGrid';
import { useQueryParams } from '../../core/routing/useQueryParams';
import { SEARCH_TERMS_URL_PARAM } from './constants';
import SearchView from './SearchView';
import { journeyFilterConfig } from '../../domain/platform/search/Filter';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import DialogHeader from '../../core/ui/dialog/DialogHeader';
import { DialogContent } from '@mui/material';
import { Search } from '@mui/icons-material';
import { useEffect, useLayoutEffect, useState } from 'react';
import { setTransactionScope } from '../../core/logging/sentry/scope';

const SearchDialog = () => {
  const { pathname } = useLocation();

  const queryParams = useQueryParams();

  const hasSearchParam = queryParams.has(SEARCH_TERMS_URL_PARAM);

  // State is duplicated because we don't want to close the dialog when search terms are cleared
  const [isSearchDialogOpen, setIsSearchDialogOpen] = useState(hasSearchParam);

  useEffect(() => {
    if (isSearchDialogOpen) {
      setTransactionScope({
        type: 'connect(search)',
      });
    }
  }, [isSearchDialogOpen]);

  useLayoutEffect(() => {
    if (hasSearchParam) {
      setIsSearchDialogOpen(true);
    }
  }, [hasSearchParam]);

  const navigate = useNavigate();

  const handleClose = () => {
    navigate(pathname, { replace: true });
    setIsSearchDialogOpen(false);
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
