import React, { PropsWithChildren } from 'react';
import { BlockSectionTitle, CaptionBold } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import RoundedBadge from '../../../../core/ui/icon/RoundedBadge';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { CalendarEventCardData } from './CalendarEventCard';
import { formatBadgeDate, formatLongDate, formatTimeAndDuration } from '../../utils';
import CardHeaderDetail from '../../../../core/ui/card/CardHeaderDetail';
import { ClockIcon } from '../icons/ClockIcon';
import { CalendarIcon } from '../icons/CalendarIcon';
import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface CardTitleSectionProps {
  event: CalendarEventCardData;
}

const EventCardHeader = ({ event, children }: PropsWithChildren<CardTitleSectionProps>) => {
  const { t } = useTranslation();
  return (
    <BadgeCardView
      visual={
        <RoundedBadge marginLeft={0.5} size="medium">
          <CaptionBold>{formatBadgeDate(event.startDate)}</CaptionBold>
        </RoundedBadge>
      }
      height={gutters(3)}
      paddingX={1}
      gap={1}
      contentProps={{ paddingLeft: 0.5 }}
    >
      <BlockSectionTitle noWrap>{event.displayName}</BlockSectionTitle>
      <Box display="flex" gap={gutters()} flexDirection="row">
        {/* event.location && <CardHeaderDetail iconComponent={LocationIcon}>Location, City</CardHeaderDetail> */}
        <CardHeaderDetail iconComponent={CalendarIcon}>{formatLongDate(event.startDate)}</CardHeaderDetail>
        <CardHeaderDetail iconComponent={ClockIcon}>{formatTimeAndDuration(event, t)}</CardHeaderDetail>
      </Box>
      {children}
    </BadgeCardView>
  );
};

export default EventCardHeader;
