import React, { ComponentType, FC, useMemo } from 'react';
import {
  alpha,
  Box,
  styled,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemProps,
  ListItemText,
} from '@mui/material';

export interface CategoryConfig {
  title: string;
  icon?: ComponentType;
}

interface CategorySelectorProps {
  categories: CategoryConfig[];
  value: string | null;
  showLabels?: boolean;
  onSelect?: (category: string) => void;
}

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
  value = null,
  showLabels = true,
  onSelect,
}) => {
  const items = useMemo(
    () =>
      categories.map(({ title, icon: Icon }) => (
        <StyledListItemButton
          key={title}
          selected={value === title}
          disableGutters={!showLabels}
          onClick={() => onSelect?.(title)}
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
      )),
    [showLabels, categories, value]
  );

  return <List disablePadding>{items}</List>;
};
export default CategorySelector;
