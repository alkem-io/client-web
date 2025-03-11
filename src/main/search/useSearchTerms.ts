import { useMemo } from 'react';

import { useLocation } from 'react-router-dom';

import { MAX_TERMS_SEARCH } from './SearchView';
import { SEARCH_TERMS_URL_PARAM } from './constants';

export const useSearchTerms = () => {
  const { search } = useLocation();

  return useMemo(() => {
    const params = new URLSearchParams(search);
    const terms = params.getAll(SEARCH_TERMS_URL_PARAM).filter(Boolean);

    if (terms.length > MAX_TERMS_SEARCH) {
      return [...terms.slice(0, MAX_TERMS_SEARCH - 1), terms.slice(MAX_TERMS_SEARCH - 1).join(' ')];
    }

    return terms;
  }, [search]);
};
