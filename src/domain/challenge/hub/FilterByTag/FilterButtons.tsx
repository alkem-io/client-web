import React, { PropsWithChildren, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, ButtonProps, styled } from '@mui/material';
import { differenceBy, keyBy, uniq, without } from 'lodash';
import { Caption } from '../../../../core/ui/typography';
import CloseIcon from '@mui/icons-material/Close';
import { gutters } from '../../../../core/ui/grid/utils';

const showAllKey = 'show-all';
const otherKey = 'other';

const StyledFilterList = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: gutters(0.5)(theme),
}));

interface FilterChipProps {
  selected?: boolean;
  canRemove?: boolean;
  onClick?: ButtonProps['onClick'];
}

const FilterChip = ({ children, selected = false, canRemove = false, onClick }: PropsWithChildren<FilterChipProps>) => {
  return (
    <Button
      sx={{
        height: gutters(1.5),
        textTransform: 'none',
        whiteSpace: 'nowrap',
      }}
      variant={selected ? 'contained' : 'outlined'}
      endIcon={canRemove ? <CloseIcon /> : undefined}
      onClick={onClick}
    >
      {children}
    </Button>
  );
};

interface Category<Key extends string> {
  name: string;
  key: Key;
  tags: string[];
}

interface FilterByTagButtonsProps<Option extends string> {
  value: string[];
  config: Category<Option>[];
  onChange: (tags: string[]) => void;
}

const optionallyAddOther = (tags: string[], showOther: boolean) => (showOther ? [...tags, otherKey] : tags);

const removeMatchingTags = (source: readonly string[], tags: readonly string[]) =>
  differenceBy(source, tags, tag => tag.toLowerCase());

const FilterByTagButtons = <Option extends string>({ value, config, onChange }: FilterByTagButtonsProps<Option>) => {
  const { t } = useTranslation();

  const showAll = value.length === 0;
  const tags = without(value, otherKey);
  const showOther = value.includes(otherKey);

  const options = config.map(category => category.key);
  const categoriesByKey = useMemo(() => keyBy(config, 'key'), [config]);

  const selectedCategories = options.filter(option => {
    const categoryTags = categoriesByKey[option].tags;
    return removeMatchingTags(categoryTags, tags).length === 0;
  });

  const unmatchedTags = tags.filter(tag => {
    return !selectedCategories.some(option => {
      const categoryTags = categoriesByKey[option].tags;
      return categoryTags.includes(tag);
    });
  });

  const handleShowAll = () => onChange([]);

  const handleShowOther = () => {
    onChange(optionallyAddOther(tags, true));
  };

  const handleRemoveOther = () => {
    console.log(tags, optionallyAddOther(tags, false));
    onChange(optionallyAddOther(tags, false));
  };

  const handleAddFilter = (option: Option) => {
    const categoryTags = categoriesByKey[option].tags;
    onChange(uniq(optionallyAddOther([...tags, ...categoryTags], showOther)));
  };

  const handleRemoveCategory = (option: Option) => {
    const categoryTags = categoriesByKey[option].tags;
    onChange(removeMatchingTags(value, categoryTags));
  };

  const handleRemoveTag = (tag: string) => {
    onChange(removeMatchingTags(value, [tag]));
  };

  return (
    <>
      <StyledFilterList>
        <Caption>{t('hubs-filter.current-filter')}</Caption>
        {showAll && <FilterChip selected>{t(`hubs-filter.${showAllKey}` as const)}</FilterChip>}
        {showOther && (
          <FilterChip selected canRemove onClick={handleRemoveOther}>
            {t(`hubs-filter.${otherKey}` as const)}
          </FilterChip>
        )}
        {selectedCategories.map(key => (
          <FilterChip key={key} selected canRemove onClick={() => handleRemoveCategory(key)}>
            {categoriesByKey[key].name}
          </FilterChip>
        ))}
        {unmatchedTags.map(tag => (
          <FilterChip key={tag} selected canRemove onClick={() => handleRemoveTag(tag)}>
            {tag}
          </FilterChip>
        ))}
      </StyledFilterList>
      <StyledFilterList>
        {without(options, ...selectedCategories).map(key => (
          <FilterChip key={key} onClick={() => handleAddFilter(key)}>
            {categoriesByKey[key].name}
          </FilterChip>
        ))}
        {!showOther && <FilterChip onClick={handleShowOther}>{t(`hubs-filter.${otherKey}` as const)}</FilterChip>}
        {!showAll && <FilterChip onClick={handleShowAll}>{t(`hubs-filter.${showAllKey}` as const)}</FilterChip>}
      </StyledFilterList>
    </>
  );
};

export default FilterByTagButtons;
