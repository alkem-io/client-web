import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { Caption } from '../../../../core/ui/typography';
import RoundedBadge, { RoundedBadgeProps } from '../../../../core/ui/icon/RoundedBadge';
import { formatBadgeDate, formatTooltipDate, startOfDay } from '../../../../core/utils/time/utils';
import ToggleableTooltip from '../../../../core/ui/tooltip/ToggleableTooltip';
import { useTheme } from '@mui/material';

interface CalendarEventBadgeProps extends Partial<RoundedBadgeProps> {
  eventStartDate: Date | undefined;
  tooltipDisabled?: boolean;
}

const CalendarEventBadge = ({ eventStartDate, tooltipDisabled = false, ...badgeProps }: CalendarEventBadgeProps) => {
  const isPast = useMemo(() => {
    const currentDate = startOfDay();
    return dayjs(eventStartDate).isBefore(currentDate);
  }, [eventStartDate]);
  const theme = useTheme();

  return (
    <RoundedBadge size="medium" color={isPast ? theme.palette.divider : theme.palette.primary.main} {...badgeProps}>
      <ToggleableTooltip title={formatTooltipDate(eventStartDate)} disabled={tooltipDisabled}>
        <Caption color={isPast ? theme.palette.neutral.light : theme.palette.primary.contrastText}>
          {formatBadgeDate(eventStartDate)}
        </Caption>
      </ToggleableTooltip>
    </RoundedBadge>
  );
};

export default CalendarEventBadge;
