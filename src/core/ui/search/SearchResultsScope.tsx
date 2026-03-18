import { Box } from '@mui/material';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import Gutters from '../grid/Gutters';
import { Caption } from '../typography';

interface SearchResultsScopeProps {
  currentScope: ReactNode;
  alternativeScope?: ReactNode;
}

const SearchResultsScope = ({ currentScope, alternativeScope }: SearchResultsScopeProps) => {
  const { t } = useTranslation();

  return (
    <Gutters row={true} disablePadding={true}>
      <Box display="flex" gap={0.5} alignItems="center">
        <Caption>{t('components.searchScope.currentScope')}</Caption>
        {currentScope}
      </Box>
      {alternativeScope && (
        <Box display="flex" gap={0.5} alignItems="center">
          <Caption>{t('components.searchScope.alternativeScope')}</Caption>
          {alternativeScope}
        </Box>
      )}
    </Gutters>
  );
};

export default SearchResultsScope;
