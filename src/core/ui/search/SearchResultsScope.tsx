import Gutters from '../grid/Gutters';
import { Box } from '@mui/material';
import { Caption } from '../typography';
import { useTranslation } from 'react-i18next';
import { ReactNode } from 'react';

interface SearchResultsScopeProps {
  currentScope: ReactNode;
  alternativeScope?: ReactNode;
}

const SearchResultsScope = ({ currentScope, alternativeScope }: SearchResultsScopeProps) => {
  const { t } = useTranslation();

  return (
    <Gutters row disablePadding>
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
