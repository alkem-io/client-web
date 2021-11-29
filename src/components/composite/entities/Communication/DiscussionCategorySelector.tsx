import { alpha, Box, List, ListItemButton, ListItemIcon, ListItemProps, ListItemText, styled } from '@mui/material';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { DiscussionCategoryExt, DiscussionCategoryExtEnum } from '../../../../models/enums/DiscussionCategoriesExt';
import { DiscussionCategory } from '../../../../models/graphql-schema';
import DiscussionIcon, { DiscussionIconProps } from './DiscussionIcon';
import { ConditionalTooltip } from '../../../core/ConditionalTooltip';

interface DiscussionCategorySelectorProps {
  value?: DiscussionCategoryExt;
  showLabels?: boolean;
  onSelect?: (category: DiscussionCategoryExt) => void;
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
  showLabels = true,
  onSelect,
}) => {
  const { t } = useTranslation();

  const handleSelect = (selectedValue: DiscussionCategoryExt) => {
    onSelect && onSelect(selectedValue);
  };

  return (
    <List>
      <ConditionalTooltip
        show={!showLabels}
        arrow
        placement="right-end"
        title={t('components.discussion-category-selector.ALL')}
      >
        <StyledListItemButton
          disableGutters={!showLabels}
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
          {showLabels && (
            <ListItemText>
              <Box component="span" fontWeight="bold">
                {t('components.discussion-category-selector.ALL')}
              </Box>
            </ListItemText>
          )}
        </StyledListItemButton>
      </ConditionalTooltip>
      {Object.values(DiscussionCategory).map((k, i) => (
        <ConditionalTooltip
          key={i}
          show={!showLabels}
          arrow
          placement="right-end"
          title={t(`components.discussion-category-selector.${k}` as const)}
        >
          <StyledListItemButton selected={value === k} disableGutters={!showLabels} onClick={() => handleSelect(k)}>
            <ListItemIcon>
              <StyledDiscussionIcon selected={value === k} color="primary" category={k} />
            </ListItemIcon>
            {showLabels && (
              <ListItemText>
                <Box component="span" fontWeight="bold">
                  {t(`components.discussion-category-selector.${k}` as const)}
                </Box>
              </ListItemText>
            )}
          </StyledListItemButton>
        </ConditionalTooltip>
      ))}
    </List>
  );
};
export default DiscussionCategorySelector;
