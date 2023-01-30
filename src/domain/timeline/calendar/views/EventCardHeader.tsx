import { Box, Skeleton } from '@mui/material';
import { PropsWithChildren } from 'react';
import { useTranslation } from 'react-i18next';
import CardHeaderDetail from '../../../../core/ui/card/CardHeaderDetail';
import { gutters } from '../../../../core/ui/grid/utils';
import RoundedBadge from '../../../../core/ui/icon/RoundedBadge';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { BlockSectionTitle, Caption } from '../../../../core/ui/typography';
import { formatBadgeDate, formatLongDate, formatTimeAndDuration } from '../../../../core/utils/time/utils';
import { CalendarIcon } from '../icons/CalendarIcon';
import { ClockIcon } from '../icons/ClockIcon';
import { CalendarEventCardData } from './CalendarEventCard';

interface CardTitleSectionProps {
  event: CalendarEventCardData | undefined;
}

const EventCardHeader = ({ event, children }: PropsWithChildren<CardTitleSectionProps>) => {
  const { t } = useTranslation();
  return (
    <BadgeCardView
      visual={
        <RoundedBadge marginLeft={0.5} size="medium">
          <Caption>{formatBadgeDate(event?.startDate)}</Caption>
        </RoundedBadge>
      }
      height={gutters(3)}
      paddingX={1}
      gap={1}
      contentProps={{ paddingLeft: 0.5 }}
    >
      <BlockSectionTitle noWrap>{event?.displayName}</BlockSectionTitle>
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
