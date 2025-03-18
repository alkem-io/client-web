import { useMemo } from 'react';

import { useLocation } from 'react-router-dom';

export const useQueryParams = () => {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
};

export const useMemoizedQueryParams = () => {
  const { search } = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(search);

    const entries = Array.from(params.entries()).reduce<Record<string, string[]>>((acc, [key, value]) => {
      if (!acc[key]) acc[key] = [];
      acc[key].push(value);

      return acc;
    }, {});

    return entries;
  }, [search]);
};
