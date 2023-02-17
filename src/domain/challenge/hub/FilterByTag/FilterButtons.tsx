import React from 'react';
import { useTranslation } from 'react-i18next';
import { styled, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { without } from 'lodash';

const showAllKey = 'show-all';
const otherKey = 'other';

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
    },
  },
}));

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
  const handleChangeCategory = (event: React.MouseEvent<HTMLElement>, nextCategories: string[]) => {
    onChange(showOther ? [...nextCategories, otherKey] : nextCategories);
  };
  const handleShowOther = () => {
    onChange(showOther ? categories : [...categories, otherKey]);
  };

  return (
    <>
      <ToggleButton selected={showAll} value={showAllKey} onClick={handleShowAll}>
        {t(`components.tag-filter.${showAllKey}` as const)}
      </ToggleButton>
      <StyledToggleButtonGroup
        color="primary"
        value={categories}
        onChange={handleChangeCategory}
        aria-label="Filter Hubs by category"
      >
        {options.map(key => (
          <ToggleButton value={key} key={key}>
            {/* @ts-ignore */}
            {t(`components.tag-filter.${key}` as const)}
          </ToggleButton>
        ))}
      </StyledToggleButtonGroup>
      <ToggleButton selected={showOther} value={showOther} onClick={handleShowOther}>
        {t(`components.tag-filter.${otherKey}` as const)}
      </ToggleButton>
    </>
  );
};

export default FilterByTagButtons;
