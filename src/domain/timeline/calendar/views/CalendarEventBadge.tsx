import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { Caption } from '@core/ui/typography';
import RoundedBadge, { RoundedBadgeProps } from '@core/ui/icon/RoundedBadge';
import { formatBadgeDate, formatLongDateTimeString, startOfDay } from '@core/utils/time/utils';
import ToggleableTooltip from '@core/ui/tooltip/ToggleableTooltip';
import { Box, useTheme } from '@mui/material';

interface CalendarEventBadgeProps extends Partial<RoundedBadgeProps> {
  startDate: Date | undefined;
  durationMinutes: number;
  durationDays: number | undefined;
  tooltipDisabled?: boolean;
}

const CalendarEventBadge = ({
  startDate,
  durationMinutes,
  durationDays,
  tooltipDisabled = false,
  ...badgeProps
}: CalendarEventBadgeProps) => {
  const isPast = useMemo(() => {
    const currentDate = startOfDay();
    return dayjs(startDate).isBefore(currentDate);
  }, [startDate]);
  const theme = useTheme();

  const dates = formatBadgeDate({ startDate, durationMinutes, durationDays });
  const tooltipText = formatLongDateTimeString({ startDate, durationMinutes, durationDays });

  return (
    <RoundedBadge
      size="medium"
      color={isPast ? theme.palette.divider : theme.palette.background.default}
      borderRadius="12%"
      {...badgeProps}
    >
      <ToggleableTooltip title={tooltipText} disabled={tooltipDisabled}>
        <div>
          <Caption color={theme.palette.primary.main}>
            {dates.startDate}
            {dates.endDate && <Box color={theme.palette.primary.main}>{dates.endDate}</Box>}
          </Caption>
        </div>
      </ToggleableTooltip>
    </RoundedBadge>
  );
};

export default CalendarEventBadge;
