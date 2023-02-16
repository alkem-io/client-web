import React, { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ToggleButton, ToggleButtonGroup, styled } from '@mui/material';
import { Identifiable } from '../../../shared/types/Identifiable';
import filterFn, { ValueType } from '../../../../common/components/core/card-filter/filterFn';
import { FILTER_PARAM_NAME } from '../../../../core/routing/route.constants';

const showAllKey = 'show-all';
const otherKey = 'other';

const filterConfig = {
  'energy-transition': ['Energy Transition', 'Energietransitie'],
  'inclusive-society': ['Inclusive Society', 'Inclusieve Samenleving'],
  'public-services': ['Public Services', 'Publieke Diensten'],
  'innovation': ['Innovation', 'Innovatie'],
  'supporting-vulnerable-groups': ['Supporting Vulnerable Groups', 'Kwetsbare Groepen'],
  'digitalization-of-society': ['Digitalization of Society', 'Digitalisering'],
};

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  gap: theme.spacing(2),
  '& .MuiToggleButtonGroup-grouped': {
    border: `1px solid ${theme.palette.primary.main}`,
    '&:not(:first-of-type)': {
      border: `1px solid ${theme.palette.primary.main}`,
      borderRadius: theme.shape.borderRadius,
    },
    '&:first-of-type': {
      borderRadius: theme.shape.borderRadius,
    },
    '& .Mui-selected': {
      color: 'white',
      backgroundColor: theme.palette.primary.main,
    }
  },
}));

const StyledToggleButton = styled(ToggleButton)(({ theme }) => ({
}));


interface FilterByTagProps<T extends Identifiable> {
  items: T[];
  valueGetter: (data: T) => ValueType;
  children: (filteredItems: T[]) => React.ReactNode;
}

const FilterByTag = <T extends Identifiable>({ items, valueGetter, children }: FilterByTagProps<T>) => {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [categories, setCategories] = useState<string[]>([]);
  const [showAll, setShowAll] = useState(true);
  const [showOther, setShowOther] = useState(false);

  const { search: params } = useLocation();
  const queryParams = new URLSearchParams(params);
  const queryParam = queryParams.get(FILTER_PARAM_NAME);

  const termsFromUrl = useMemo(
    () => (queryParam?.split(',') ?? []).map(escape),
    [queryParam]
  );

  const filterKeys = Object.keys(filterConfig);
  const filterValues = Object.values(filterConfig).flat(1).map(x => x.toLocaleLowerCase());

  // useEffect(() => {
  //   if (termsFromUrl.length > 0) {
  //     setShowAll(false);
  //   }
  //
  //   const validCategories = termsFromUrl.filter(x => filterKeys.includes(x));
  //   setCategories(validCategories);
  //
  //   if (termsFromUrl.includes(otherKey)) {
  //     setShowOther(true);
  //   }
  // }, [termsFromUrl, filterKeys, setShowAll, setShowOther]);

  const handleChangeCategory = (event: React.MouseEvent<HTMLElement>, newValue: string[]) => {
    setCategories(newValue);
    // if no categories are selected - select 'show all'
    setShowAll(newValue.length === 0 && !showOther);

    const termsArray = [...categories];

    if (showOther) {
      termsArray.push(otherKey);
    }

    const terms = termsArray.join(',');
    const params = new URLSearchParams({ [FILTER_PARAM_NAME]: terms });
    navigate(`/?${params}`);
  };

  const handleShowAll = () => {
    setCategories([]);
    setShowOther(false);
    setShowAll(true);
  };

  const handleShowOther = () => {
    setShowAll(categories.length === 0 && showOther);
    setShowOther(oldValue => !oldValue);
  };
  // terms that fit the "Other" category -> the subset of tags that are not in any filters
  // used to filter by them if "Other" is selected
  const otherTerms = useMemo(
    () => items
      .map(x => valueGetter(x).values)
      .flat(1)
      .map(x => x.toLocaleLowerCase())
      .filter(x => !filterValues.includes(x))
    ,
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

  const filteredItems = useMemo(
    () => {
      const filtered = filterFn(items, showOther ? [ ...categoryTerms, ...otherTerms] : categoryTerms, valueGetter);

      if (showOther) {
        return [...filtered, ...itemsWithoutTags];
      }

      return filtered;
    },
    [items, categoryTerms, valueGetter, otherTerms, showOther, itemsWithoutTags]
  );


  return (
    <>
      <StyledToggleButton
        selected={showAll}
        value={showAllKey}
        onClick={handleShowAll}
      >
        {t(`components.tag-filter.${showAllKey}` as const)}
      </StyledToggleButton>
      <StyledToggleButtonGroup
        color="primary"
        value={categories}
        onChange={handleChangeCategory}
        aria-label="Filter Hubs by category"
      >
        {filterKeys.map(key => (
          <StyledToggleButton value={key} key={key}>
            {/* @ts-ignore */}
            {t(`components.tag-filter.${key}` as const)}
          </StyledToggleButton>
        ))}
      </StyledToggleButtonGroup>
      <StyledToggleButton
        selected={showOther}
        value={showOther}
        onClick={handleShowOther}
      >
        {t(`components.tag-filter.${otherKey}` as const)}
      </StyledToggleButton>
      {children(filteredItems)}
    </>
  )
};

export default FilterByTag;