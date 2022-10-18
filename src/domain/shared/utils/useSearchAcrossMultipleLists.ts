import { Identifiable } from '../types/Identifiable';
import { Dispatch, useMemo, useState } from 'react';
import filterFn, { ValueGetter } from '../../../common/components/core/card-filter/filterFn';
import { mapValues } from 'lodash';
import { PossiblyUndefinedProps } from '../types/PossiblyUndefinedProps';
import getDepsValueFromObject from './getDepsValueFromObject';

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

  const depsValueFromObjectBundle = getDepsValueFromObject(bundle);

  const filtered = useMemo(() => {
    return mapValues(bundle, (list, listName) => {
      const valueGetter = valueGetters[listName];
      return filterFn(list ?? [], contributorsSearchTerms, valueGetter);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contributorsSearchTerms, depsValueFromObjectBundle, valueGetters]);

  return {
    ...filtered,
    searchTerms: contributorsSearchTerms,
    onSearchTermsChange: setContributorsSearchTerms,
  } as UseContributorsSearchProvided<Items>;
};

export default useSearchAcrossMultipleLists;
