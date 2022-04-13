import {
  alpha,
  Box,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemProps,
  ListItemText,
  styled,
  Typography,
} from '@mui/material';
import React, { ComponentType, FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface CategoryConfig {
  title: string;
  icon?: ComponentType;
}

interface CategorySelectorProps {
  categories: CategoryConfig[];
  value?: string;
  showLabels?: boolean;
  onSelect?: (category: string) => void;
}

export const CATEGORY_ALL = 'Show all';

const StyledListItemButton = styled(ListItemButton)<ListItemProps>(({ theme }) => ({
  '&.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.neutralLight.main,
    '&:hover': {
      backgroundColor: alpha(theme.palette.primary.main, 0.5),
      color: theme.palette.neutralLight.main,
      '& > * > svg': {
        color: theme.palette.neutralLight.main,
      },
    },
  },
  '&:hover': {
    backgroundColor: alpha(theme.palette.primary.main, 0.2),
  },
  centerIcon: {
    justifyContent: 'center',
  },
  noGutters: {
    padding: 0,
  },
}));

export const CategorySelector: FC<CategorySelectorProps> = ({
  categories,
  value = CATEGORY_ALL,
  showLabels = true,
  onSelect,
}) => {
  const { t } = useTranslation();

  const handleSelect = (selectedValue: string) => onSelect?.(selectedValue);

  const items = useMemo(
    () => (
      <>
        <StyledListItemButton
          disableGutters={!showLabels}
          selected={value === CATEGORY_ALL}
          onClick={() => handleSelect(CATEGORY_ALL)}
        >
          {showLabels && (
            <ListItemText sx={{ justifyContent: 'center' }}>
              <Box
                component={Typography}
                noWrap
                fontWeight="bold"
                display="flex"
                sx={{ textTransform: 'uppercase', justifyContent: 'center' }}
              >
                {t('components.category-selector.all')}
              </Box>
            </ListItemText>
          )}
        </StyledListItemButton>
        {categories.map(({ title, icon: Icon }) => (
          <StyledListItemButton
            key={title}
            selected={value === title}
            disableGutters={!showLabels}
            onClick={() => handleSelect(title)}
          >
            {Icon && (
              <ListItemIcon
                sx={{
                  justifyContent: !showLabels ? 'center' : 'flex-start',
                  color: value === title ? 'neutralLight.main' : undefined,
                }}
              >
                <Icon />
              </ListItemIcon>
            )}
            {showLabels && (
              <ListItemText>
                <Box
                  component={Typography}
                  noWrap
                  fontWeight="bold"
                  display="flex"
                  sx={{ textTransform: 'uppercase', justifyContent: !Icon ? 'center' : 'flex-start' }}
                >
                  {title}
                </Box>
              </ListItemText>
            )}
          </StyledListItemButton>
        ))}
      </>
    ),
    [handleSelect, showLabels, categories, value]
  );

  return <List disablePadding>{items}</List>;
};
export default CategorySelector;
