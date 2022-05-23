import { Dispatch, SetStateAction, useMemo, useState } from 'react';

interface UseLocalSearchOptions<Item> {
  data: Item[] | undefined;
  initialSearchTermValue?: string;
  isMatch: (item: Item, searchTerm: string) => boolean;
}

interface UseLocalSearchResult<Item> {
  data: Item[] | undefined;
  setSearchTerm: Dispatch<SetStateAction<string>>;
}

const useLocalSearch = <Item>(options: UseLocalSearchOptions<Item>): UseLocalSearchResult<Item> => {
  const { data, isMatch, initialSearchTermValue = '' } = options;

  const [searchTerm, setSearchTerm] = useState(initialSearchTermValue);

  const filteredData = useMemo(() => {
    if (!data || !searchTerm) {
      return data;
    }

    return data.filter(item => isMatch(item, searchTerm));
  }, [searchTerm, data]);

  return {
    data: filteredData,
    setSearchTerm,
  };
};

export default useLocalSearch;
