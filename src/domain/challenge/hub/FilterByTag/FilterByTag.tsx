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

  // terms that fit the "Other" category -> the subset of tags that are not in any filters
  // used to filter by them if "Other" is selected
  const otherTerms = useMemo(
    () =>
      items
        .map(x => valueGetter(x).values)
        .flat(1)
        .map(x => x.toLocaleLowerCase())
        .filter(x => !filterValues.includes(x)),
    [items, filterValues, valueGetter]
  );
  // todo: how to include items without tags in the "Other" category
  // included in the result when "Other" is selected
  const itemsWithoutTags = useMemo(
    () => items.filter(x => valueGetter(x).values.length === 0).map(x => ({ ...x, matchedTerms: [] })),
    [items, valueGetter]
  );
  // all terms from the button selection
  const categoryTerms = categories?.map<string[]>(x => filterConfig[x]).flat(1);

  const filteredItems = useMemo(() => {
    const filtered = filterFn(items, showOther ? [...categoryTerms, ...otherTerms] : categoryTerms, valueGetter);

    if (showOther) {
      return [...filtered, ...itemsWithoutTags];
    }

    return filtered;
  }, [items, categoryTerms, valueGetter, otherTerms, showOther, itemsWithoutTags]);

  return <>{children({ items: filteredItems, value: termsFromUrl, handleChange: updateQueryString })}</>;
};

export default FilterByTag;
