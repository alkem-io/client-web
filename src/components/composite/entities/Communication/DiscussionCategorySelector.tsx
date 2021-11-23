import { Box, emphasize, List, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import { ListItemProps, styled } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { DiscussionCategoryExt, DiscussionCategoryExtEnum } from '../../../../models/enums/DiscussionCategoriesExt';
import { DiscussionCategory } from '../../../../models/graphql-schema';
import DiscussionIcon, { DiscussionIconProps } from './DiscussionIcon';

interface DiscussionCategorySelectorProps {
  value?: DiscussionCategoryExt;
  onSelect?: (category: DiscussionCategoryExt) => void;
}

const StyledListItemButton = styled(ListItemButton)<ListItemProps>(({ theme }) => ({
  '&.MuiListItemMuiListItemButton-root.Mui-selected': {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.neutralLight.main,
    '&:hover': {
      backgroundColor: emphasize(theme.palette.primary.main, 0.5),
    },
  },
  '&:hover': {
    backgroundColor: emphasize(theme.palette.primary.main, 0.5),
  },
}));

interface StyledDiscussionIconProps extends DiscussionIconProps {
  selected: boolean;
}

const StyledDiscussionIcon = styled(DiscussionIcon, {
  shouldForwardProp: prop => prop !== 'selected',
})<StyledDiscussionIconProps>(({ selected, theme }) => ({
  ...(selected && {
    color: theme.palette.neutralLight.main,
  }),
}));

export const DiscussionCategorySelector: FC<DiscussionCategorySelectorProps> = ({
  value = DiscussionCategoryExtEnum.All,
  onSelect,
}) => {
  const { t } = useTranslation();

  const handleSelect = (selectedValue: DiscussionCategoryExt) => {
    onSelect && onSelect(selectedValue);
  };

  return (
    <List>
      <StyledListItemButton
        selected={value === DiscussionCategoryExtEnum.All}
        onClick={() => handleSelect(DiscussionCategoryExtEnum.All)}
      >
        <ListItemIcon>
          <StyledDiscussionIcon
            selected={value === DiscussionCategoryExtEnum.All}
            color="primary"
            category={DiscussionCategoryExtEnum.All}
          />
        </ListItemIcon>
        <ListItemText>
          <Box component="span" fontWeight="bold">
            {t('components.discussion-category-selector.ALL')}
          </Box>
        </ListItemText>
      </StyledListItemButton>
      {Object.values(DiscussionCategory).map((k, i) => (
        <StyledListItemButton key={i} selected={value === k} onClick={() => handleSelect(k)}>
          <ListItemIcon>
            <StyledDiscussionIcon selected={value === k} color="primary" category={k} />
          </ListItemIcon>
          <ListItemText>
            <Box component="span" fontWeight="bold">
              {t(`components.discussion-category-selector.${k}` as const)}
            </Box>
          </ListItemText>
        </StyledListItemButton>
      ))}
    </List>
  );
};
export default DiscussionCategorySelector;
