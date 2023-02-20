import React, { useMemo } from 'react';
import dayjs from 'dayjs';
import { Caption } from '../../../../core/ui/typography';
import RoundedBadge, { RoundedBadgeProps } from '../../../../core/ui/icon/RoundedBadge';
import { formatBadgeDate, formatTooltipDate, startOfDay } from '../../../../core/utils/time/utils';
import ToggleableTooltip from '../../../../core/ui/tooltip/ToggleableTooltip';

interface CalendarEventBadgeProps extends Partial<RoundedBadgeProps> {
  eventStartDate: Date | undefined;
  tooltipDisabled?: boolean;
}

const CalendarEventBadge = ({ eventStartDate, tooltipDisabled = false, ...badgeProps }: CalendarEventBadgeProps) => {
  const isPast = useMemo(() => {
    const currentDate = startOfDay();
    return dayjs(eventStartDate).isBefore(currentDate);
  }, [eventStartDate]);

  return (
    <RoundedBadge size="medium" color={isPast ? 'neutral.light' : undefined} {...badgeProps}>
      <ToggleableTooltip title={formatTooltipDate(eventStartDate)} disabled={tooltipDisabled}>
        <Caption>{formatBadgeDate(eventStartDate)}</Caption>
      </ToggleableTooltip>
    </RoundedBadge>
  );
};

export default CalendarEventBadge;
