import { Box, Skeleton } from '@mui/material';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import CardHeaderDetail from '@/core/ui/card/CardHeaderDetail';
import { gutters } from '@/core/ui/grid/utils';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import { BlockSectionTitle } from '@/core/ui/typography';
import { formatLongDate, formatTime, formatTimeAndDuration, getEndDateByDuration } from '@/core/utils/time/utils';
import { CalendarIcon } from '../icons/CalendarIcon';
import { ClockIcon } from '../icons/ClockIcon';
import CalendarEventBadge from './CalendarEventBadge';
import SpaceL1Icon2 from '@/domain/space/icons/SpaceL1Icon2';
import { useScreenSize } from '@/core/ui/grid/constants';

export interface EventCardHeaderProps {
  event:
    | {
        startDate?: Date;
        durationDays?: number | undefined;
        durationMinutes: number;
        wholeDay?: boolean;
        profile: {
          displayName: string;
        };
        subspace?: {
          about: {
            profile: {
              displayName: string;
            };
          };
        };
      }
    | undefined;
}

const EventCardHeader = ({ event, children }: PropsWithChildren<EventCardHeaderProps>) => {
  const { t } = useTranslation();
  const { isSmallScreen } = useScreenSize();

  const startDate = event?.startDate;
  const endDate = getEndDateByDuration(startDate, event?.durationMinutes ?? 0);
  const hasEndDate = (event?.durationDays ?? 0) > 0 && !event?.wholeDay;

  return (
    <BadgeCardView
      visual={
        <CalendarEventBadge
          startDate={startDate}
          durationDays={event?.durationDays ?? 0}
          durationMinutes={event?.durationMinutes ?? 0}
          marginLeft={0.5}
          tooltipDisabled
        />
      }
      height={isSmallScreen ? 'auto' : gutters(3)}
      paddingX={1}
      gap={1}
      contentProps={{ paddingLeft: 0.5 }}
    >
      <BlockSectionTitle noWrap>{event?.profile.displayName}</BlockSectionTitle>
      <Box display="flex" gap={isSmallScreen ? 0 : gutters()} flexDirection={isSmallScreen ? 'column' : 'row'}>
        {event && (
          <>
            <CardHeaderDetail iconComponent={<CalendarIcon />}>{formatLongDate(startDate)}</CardHeaderDetail>
            <CardHeaderDetail iconComponent={<ClockIcon />}>{formatTimeAndDuration(event, t)}</CardHeaderDetail>
            {hasEndDate && (
              <>
                <Box>-</Box>
                <CardHeaderDetail iconComponent={<CalendarIcon />}>{formatLongDate(endDate)}</CardHeaderDetail>
                <CardHeaderDetail iconComponent={<ClockIcon />}>{formatTime(endDate)}</CardHeaderDetail>
              </>
            )}
            {event?.subspace && (
              <CardHeaderDetail
                iconComponent={<SpaceL1Icon2 fill="primary" sx={{ maxHeight: gutters(0.7), maxWidth: gutters(0.7) }} />}
              >
                {event.subspace.about.profile.displayName}
              </CardHeaderDetail>
            )}
          </>
        )}
        {!event && <Skeleton variant="rectangular" />}
      </Box>
      {children}
    </BadgeCardView>
  );
};

export default EventCardHeader;
