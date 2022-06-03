import { Dispatch, SetStateAction, useMemo, useState } from 'react';
import { UserFilterInput } from './types';

export interface UseUsersSearchResult {
  filter: UserFilterInput | undefined;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

const useUsersSearch = (initialSearchTermValue = ''): UseUsersSearchResult => {
  const [searchTerm, setSearchTerm] = useState(initialSearchTermValue);

  const filter = useMemo(() => {
    if (!searchTerm) {
      return undefined;
    }

    return {
      firstName: searchTerm,
      lastName: searchTerm,
      email: searchTerm,
    };
  }, [searchTerm]);

  return {
    filter,
    setSearchTerm,
  };
};

export default useUsersSearch;
