import React, { ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Identifiable } from '../../../shared/types/Identifiable';
import filterFn, { ValueType } from '../../../../common/components/core/card-filter/filterFn';
import { FILTER_PARAM_NAME } from '../../../platform/routes/constants';
import { useQueryParams } from '../../../../core/routing/useQueryParams';
import { without } from 'lodash';

const otherKey = 'other';

const filterConfig = {
  'energy-transition': ['Energy Transition', 'Energietransitie'],
  'inclusive-society': ['Inclusive Society', 'Inclusieve Samenleving'],
  'public-services': ['Public Services', 'Publieke Diensten'],
  innovation: ['Innovation', 'Innovatie'],
  'supporting-vulnerable-groups': ['Supporting Vulnerable Groups', 'Kwetsbare Groepen'],
  'digitalization-of-society': ['Digitalization of Society', 'Digitalisering'],
} as const;

export const filterKeys: (keyof typeof filterConfig)[] = [
  'energy-transition',
  'inclusive-society',
  'public-services',
  'innovation',
  'supporting-vulnerable-groups',
  'digitalization-of-society',
];

interface ChildProps<Item extends Identifiable> {
  items: Item[];
  value: string[];
  handleChange: (value: string[]) => void;
}

interface FilterByTagProps<Item extends Identifiable> {
  items: Item[];
  valueGetter: (data: Item) => ValueType;
  children: ({ items, value, handleChange }: ChildProps<Item>) => ReactNode;
}

const FilterByTag = <Item extends Identifiable>({ items, valueGetter, children }: FilterByTagProps<Item>) => {
  const navigate = useNavigate();
  const queryParams = useQueryParams();

  const termsFromUrl = useMemo(() => queryParams.getAll(FILTER_PARAM_NAME), [queryParams]);

  const categories = without(termsFromUrl, otherKey);
  const showOther = termsFromUrl.includes(otherKey);

  const filterValues = Object.values(filterConfig)
    .flat(1)
    .map(x => x.toLocaleLowerCase());

  const updateQueryString = (nextCategories: string[]) => {
    const params = new URLSearchParams();
    for (const category of nextCategories) {
      params.append(FILTER_PARAM_NAME, category);
    }
    navigate(`./?${params}`, { replace: true });
  };

  // Items included in the results when the Other filter is selected
  // Hubs that don't have any of the selectable filters
  const itemsOther = useMemo(
    () =>
      items
        .filter(hub => !valueGetter(hub).values.some(tag => filterValues.includes(tag.toLowerCase())))
        .map(x => ({ ...x, matchedTerms: [] })),
    [filterValues, items, valueGetter]
  );

  // all terms from the button selection
  const categoryTerms = categories?.map<string[]>(x => filterConfig[x]).flat(1);

  const filteredItems = useMemo(() => {
    if (categoryTerms.length === 0) {
      if (showOther) {
        return itemsOther; // Show only others:
      } else {
        return items; // Show all
      }
    } else {
      const filtered = filterFn(items, categoryTerms, valueGetter); // filter the items
      if (showOther) {
        return [...filtered, ...itemsOther];
      } else {
        return filtered;
      }
    }
  }, [items, categoryTerms, valueGetter, showOther, itemsOther]);

  return <>{children({ items: filteredItems, value: termsFromUrl, handleChange: updateQueryString })}</>;
};

export default FilterByTag;
