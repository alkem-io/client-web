import { Box, Chip, MenuItem, Select, useTheme } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { NotificationFilterType } from './notificationFilters';
import { gutters } from '@/core/ui/grid/utils';
import { Caption } from '@/core/ui/typography';
import { useScreenSize } from '@/core/ui/grid/constants';

interface InAppNotificationsFilterChipsProps {
  selectedFilter: NotificationFilterType;
  onFilterChange: (filter: NotificationFilterType) => void;
}

export const InAppNotificationsFilterChips = ({
  selectedFilter,
  onFilterChange,
}: InAppNotificationsFilterChipsProps) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { isSmallScreen: isMobile } = useScreenSize();

  const filters = [
    { value: NotificationFilterType.All, label: t('components.inAppNotifications.filters.all') },
    {
      value: NotificationFilterType.MessagesAndReplies,
      label: t('components.inAppNotifications.filters.messagesAndReplies'),
    },
    { value: NotificationFilterType.Space, label: t('components.inAppNotifications.filters.space') },
    { value: NotificationFilterType.Platform, label: t('components.inAppNotifications.filters.platform') },
  ];

  const stickyStyles = {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    backgroundColor: theme.palette.background.paper,
    borderBottom: `1px solid ${theme.palette.divider}`,
  };

  if (isMobile) {
    return (
      <Box
        sx={{
          ...stickyStyles,
          padding: 2,
          paddingBottom: 1,
        }}
      >
        <Select
          value={selectedFilter}
          onChange={e => onFilterChange(e.target.value as NotificationFilterType)}
          fullWidth
          size="small"
          sx={{
            '& .MuiSelect-select': {
              paddingY: 1,
            },
          }}
        >
          {filters.map(filter => (
            <MenuItem key={filter.value} value={filter.value}>
              <Caption>{filter.label}</Caption>
            </MenuItem>
          ))}
        </Select>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        ...stickyStyles,
        display: 'flex',
        gap: 1,
        padding: 2,
        paddingBottom: 1,
        flexWrap: 'wrap',
      }}
    >
      {filters.map(filter => (
        <Chip
          key={filter.value}
          label={<Caption>{filter.label}</Caption>}
          onClick={() => onFilterChange(filter.value)}
          color={selectedFilter === filter.value ? 'primary' : 'default'}
          variant={selectedFilter === filter.value ? 'filled' : 'outlined'}
          sx={{
            height: gutters(1.5),
            borderRadius: theme => `${theme.shape.borderRadius}px`,
            cursor: 'pointer',
          }}
        />
      ))}
    </Box>
  );
};
