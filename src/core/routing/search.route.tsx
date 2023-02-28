import React, { FC } from 'react';
import { useTransactionScope } from '../analytics/useSentry';
import SearchPage from '../../domain/platform/pages/Search/SearchPage';

export const SearchRoute: FC = () => {
  useTransactionScope({ type: 'connect(search)' });

  return <SearchPage />;
};
