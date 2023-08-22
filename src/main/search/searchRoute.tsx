import React, { FC } from 'react';
import { useTransactionScope } from '../../core/analytics/useSentry';
import SearchPage from '../../domain/platform/search/SearchPage';

export const SearchRoute: FC = () => {
  useTransactionScope({ type: 'connect(search)' });

  return <SearchPage />;
};
