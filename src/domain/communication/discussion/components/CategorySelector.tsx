import { ReactElement, useMemo } from 'react';
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
import { DiscussionCategoryExt } from '../constants/DiscusionCategories';

export interface CategoryConfig {
  id: DiscussionCategoryExt;
  title: string;
  icon?: ReactElement;
}

type CategorySelectorProps = {
  categories: CategoryConfig[];
  value: string | null;
  showLabels?: boolean;
  onSelect?: (category: DiscussionCategoryExt) => void;
};

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

export const CategorySelector = ({ categories, value, showLabels = true, onSelect }: CategorySelectorProps) => {
  const items = useMemo(
    () =>
      categories.map(({ id, title, icon }) => (
        <StyledListItemButton
          key={title}
          selected={value === id}
          disableGutters={!showLabels}
          onClick={() => onSelect?.(id)}
        >
          {icon && (
            <ListItemIcon
              sx={{
                justifyContent: !showLabels ? 'center' : 'flex-start',
                color: value === id ? 'neutralLight.main' : undefined,
              }}
            >
              {icon}
            </ListItemIcon>
          )}
          {showLabels && (
            <ListItemText>
              <Box
                component={Typography}
                noWrap
                fontWeight="bold"
                display="flex"
                sx={{ textTransform: 'uppercase', justifyContent: !icon ? 'center' : 'flex-start' }}
              >
                {title}
              </Box>
            </ListItemText>
          )}
        </StyledListItemButton>
      )),
    [showLabels, categories, value, onSelect]
  );

  return <List disablePadding>{items}</List>;
};

export default CategorySelector;
