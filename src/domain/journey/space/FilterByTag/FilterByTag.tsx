import React, { ReactNode, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Identifiable } from '../../../../core/utils/Identifiable';
import filterFn, { ValueType } from '../../../../core/utils/filtering/filterFn';
// import { FILTER_PARAM_NAME } from '../../../platform/routes/constants';
import { useQueryParams } from '../../../../core/routing/useQueryParams';
import { without } from 'lodash';
import { useTranslation } from 'react-i18next';
import { FILTER_PARAM_NAME } from '../../../../main/search/constants';

const otherKey = 'other';

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
  const { t } = useTranslation();

  const termsFromUrl = useMemo(() => queryParams.getAll(FILTER_PARAM_NAME), [queryParams]);

  const tags = without(termsFromUrl, otherKey);
  const showOther = termsFromUrl.includes(otherKey);

  const filterValues = t('spaces-filter.config', { returnObjects: true })
    .flatMap(category => category.tags)
    .map(x => x.toLocaleLowerCase());

  const updateQueryString = (nextTags: string[]) => {
    const params = new URLSearchParams(window.location.search);
    params.delete(FILTER_PARAM_NAME);
    for (const tag of nextTags) {
      params.append(FILTER_PARAM_NAME, tag);
    }
    navigate(`./?${params}`, { replace: true });
  };

  // Items included in the results when the Other filter is selected
  // Spaces that don't have any of the selectable filters
  const itemsOther = useMemo(
    () =>
      items
        .filter(space => !valueGetter(space).values.some(tag => filterValues.includes(tag.toLowerCase())))
        .map(x => ({ ...x, matchedTerms: [] })),
    [filterValues, items, valueGetter]
  );

  const filteredItems = useMemo(() => {
    if (tags.length === 0) {
      if (showOther) {
        return itemsOther; // Show only others:
      } else {
        return items; // Show all
      }
    } else {
      const filtered = filterFn(items, tags, valueGetter); // filter the items
      if (showOther) {
        return [...filtered, ...itemsOther];
      } else {
        return filtered;
      }
    }
  }, [items, tags, valueGetter, showOther, itemsOther]);

  return <>{children({ items: filteredItems, value: termsFromUrl, handleChange: updateQueryString })}</>;
};

export default FilterByTag;
