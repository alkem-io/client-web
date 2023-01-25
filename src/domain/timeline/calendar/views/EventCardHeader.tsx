import React, { PropsWithChildren } from 'react';
import { BlockSectionTitle, CaptionBold } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import RoundedBadge from '../../../../core/ui/icon/RoundedBadge';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import { CalendarEventCardData } from './CalendarEventCard';
import { formatBadgeDate } from '../../utils';
import CardHeaderCaption from '../../../../core/ui/card/CardHeaderCaption';

interface CardTitleSectionProps {
  event: CalendarEventCardData;
}

const EventCardHeader = ({ event, children }: PropsWithChildren<CardTitleSectionProps>) => {
  return (
    <BadgeCardView
      visual={<RoundedBadge marginLeft={0.5} size="medium"><CaptionBold>{formatBadgeDate(event.startDate)}</CaptionBold></RoundedBadge>}
      height={gutters(3)}
      paddingX={1}
      gap={1}
      contentProps={{ paddingLeft: 0.5 }}
    >
      <BlockSectionTitle noWrap>{event.displayName}</BlockSectionTitle>
      {children}
      <CardHeaderCaption noWrap>{event.createdBy.displayName}</CardHeaderCaption>
    </BadgeCardView>
  );
};

export default EventCardHeader;
