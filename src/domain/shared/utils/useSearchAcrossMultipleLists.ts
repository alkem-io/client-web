import { Identifiable } from '../types/Identifiable';
import { Dispatch, useMemo, useState } from 'react';
import filterFn, { ValueGetter } from '../../../common/components/core/card-filter/filterFn';
import { mapValues, sortBy } from 'lodash';
import { PossiblyUndefinedProps } from '../types/PossiblyUndefinedProps';

type UseContributorsSearchProvided<Items extends {}> = Lists<Items> & {
  searchTerms: string[];
  onSearchTermsChange: Dispatch<string[]>;
};

type ValueGetters<Items extends {}> = {
  [ListName in keyof Items]: Items[ListName] extends Identifiable ? ValueGetter<Items[ListName]> : never;
};

type Lists<Items extends {}> = {
  [ListName in keyof Items]: Items[ListName] extends Identifiable ? Items[ListName][] : never;
};

const useSearchAcrossMultipleLists = <Items extends {}>(
  bundle: PossiblyUndefinedProps<Lists<Items>>,
  valueGetters: ValueGetters<Items>
): UseContributorsSearchProvided<Items> => {
  const [contributorsSearchTerms, setContributorsSearchTerms] = useState<string[]>([]);

  const filtered = useMemo(() => {
    return mapValues(bundle, (list, listName) => {
      const valueGetter = valueGetters[listName];
      return filterFn(list ?? [], contributorsSearchTerms, valueGetter);
    });
  }, [contributorsSearchTerms, ...sortBy(Object.entries(bundle), ([key]) => key).flat()]);

  return {
    ...filtered,
    searchTerms: contributorsSearchTerms,
    onSearchTermsChange: setContributorsSearchTerms,
  } as UseContributorsSearchProvided<Items>;
};

export default useSearchAcrossMultipleLists;
