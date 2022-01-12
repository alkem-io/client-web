import React, { FC, useMemo } from 'react';
import { Route } from 'react-router-dom';
import { useTransactionScope } from '../hooks';
import { SearchPage } from '../pages/Search/SearchPage';

export const SearchRoute: FC = () => {
  useTransactionScope({ type: 'connect(search)' });

  const currentPaths = useMemo(() => [], []);

  return <Route element={<SearchPage paths={currentPaths} />} />;
};
