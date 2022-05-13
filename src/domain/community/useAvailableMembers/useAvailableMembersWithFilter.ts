import { useState } from 'react';
import { FilterOptions, useAvailableMembers, UseAvailableMembersOptions } from './useAvailableMembers';

type Options = Extract<UseAvailableMembersOptions, FilterOptions>;

const useAvailableMembersWithFilter = (options: Options) => {
  const [filterTerm, setFilterTerm] = useState<string>('');

  const result = useAvailableMembers({
    ...options,
    filter: { firstName: filterTerm, lastName: filterTerm, email: filterTerm },
  });

  return {
    ...result,
    onFilter: setFilterTerm,
  };
};

export default useAvailableMembersWithFilter;
