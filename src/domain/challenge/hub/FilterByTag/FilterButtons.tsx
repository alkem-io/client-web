import React, { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, Button, ButtonProps, styled } from '@mui/material';
import { uniq, without } from 'lodash';
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

interface FilterByTagButtonsProps {
  value: string[];
  options: string[];
  onChange: (categories: string[]) => void;
}

const FilterByTagButtons = ({ value, options, onChange }: FilterByTagButtonsProps) => {
  const { t } = useTranslation();

  const showAll = value.length === 0;
  const categories = without(value, otherKey);
  const showOther = value.includes(otherKey);

  const handleShowAll = () => onChange([]);

  const handleShowOther = () => {
    onChange(showOther ? categories : [...categories, otherKey]);
  };

  const handleAddFilter = (key: string) => {
    onChange(uniq([...value, key]));
  };
  const handleRemoveFilter = (key: string) => {
    onChange(without(value, key));
  };

  return (
    <>
      <StyledFilterList>
        <Caption>{t('components.tag-filter.current-filter')}</Caption>
        {showAll && <FilterChip selected>{t(`components.tag-filter.${showAllKey}` as const)}</FilterChip>}
        {value.map(key => (
          <FilterChip key={key} selected canRemove onClick={() => handleRemoveFilter(key)}>
            {/* @ts-ignore */}
            {t(`components.tag-filter.${key}` as const)}
          </FilterChip>
        ))}
      </StyledFilterList>
      <StyledFilterList>
        {without(options, ...value).map(key => (
          <FilterChip key={key} onClick={() => handleAddFilter(key)}>
            {/* @ts-ignore */}
            {t(`components.tag-filter.${key}` as const)}
          </FilterChip>
        ))}
        {!showOther && (
          <FilterChip onClick={handleShowOther}>{t(`components.tag-filter.${otherKey}` as const)}</FilterChip>
        )}
        {!showAll && (
          <FilterChip onClick={handleShowAll}>{t(`components.tag-filter.${showAllKey}` as const)}</FilterChip>
        )}
      </StyledFilterList>
    </>
  );
};

export default FilterByTagButtons;
