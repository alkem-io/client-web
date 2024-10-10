import { Box, Skeleton } from '@mui/material';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import CardHeaderDetail from '../../../../core/ui/card/CardHeaderDetail';
import { gutters } from '../../../../core/ui/grid/utils';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { BlockSectionTitle } from '../../../../core/ui/typography';
import { formatLongDate, formatTimeAndDuration } from '../../../../core/utils/time/utils';
import { CalendarIcon } from '../icons/CalendarIcon';
import { ClockIcon } from '../icons/ClockIcon';
import CalendarEventBadge from './CalendarEventBadge';

export interface EventCardHeaderProps {
  event:
    | {
        startDate?: Date;
        durationDays?: number | undefined;
        durationMinutes: number;
        profile: {
          displayName: string;
        };
      }
    | undefined;
}

const EventCardHeader = ({ event, children }: PropsWithChildren<EventCardHeaderProps>) => {
  const { t } = useTranslation();

  return (
    <BadgeCardView
      visual={
        <CalendarEventBadge
          startDate={event?.startDate}
          durationDays={event?.durationDays ?? 0}
          durationMinutes={event?.durationMinutes ?? 0}
          marginLeft={0.5}
          tooltipDisabled
        />
      }
      height={gutters(3)}
      paddingX={1}
      gap={1}
      contentProps={{ paddingLeft: 0.5 }}
    >
      <BlockSectionTitle noWrap>{event?.profile.displayName}</BlockSectionTitle>
      <Box display="flex" gap={gutters()} flexDirection="row">
        {event && (
          <>
            {/* event.location && <CardHeaderDetail iconComponent={LocationIcon}>Location, City</CardHeaderDetail> */}
            <CardHeaderDetail iconComponent={CalendarIcon}>{formatLongDate(event.startDate)}</CardHeaderDetail>
            <CardHeaderDetail iconComponent={ClockIcon}>{formatTimeAndDuration(event, t)}</CardHeaderDetail>
          </>
        )}
        {!event && <Skeleton variant="rectangular" />}
      </Box>
      {children}
    </BadgeCardView>
  );
};

export default EventCardHeader;
