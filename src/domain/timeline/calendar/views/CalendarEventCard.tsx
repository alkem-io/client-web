import React, { useCallback } from 'react';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardHeader from '../../../../core/ui/card/CardHeader';
import CardDetails from '../../../../core/ui/card/CardDetails';
import CardDescription from '../../../../core/ui/card/CardDescription';
import CardTags from '../../../../core/ui/card/CardTags';
import CardFooter from '../../../../core/ui/card/CardFooter';
import CardFooterDate from '../../../../core/ui/card/CardFooterDate';
import MessageCounter from '../../../../core/ui/card/MessageCounter';
import { CalendarEvent, VisualUriFragment } from '../../../../core/apollo/generated/graphql-schema';
import CardHeaderCaption from '../../../../core/ui/card/CardHeaderCaption';
import { CaptionBold } from '../../../../core/ui/typography';
import EventCardHeader from './EventCardHeader';

type NeededFields = 'id' | 'nameID' | 'displayName' | 'profile' | 'type' | 'startDate';
export type CalendarEventCardData = Pick<CalendarEvent, NeededFields> & {
  bannerNarrow?: VisualUriFragment;
  createdBy: { displayName: string };
  comments?: { commentsCount?: number };
  createdDate: string | Date; // Apollo says Date while actually it's a string
};
interface CalendarEventCardProps {
  event: CalendarEventCardData;
  onClick: (event: CalendarEventCardData) => void;
}

const formatDate = (date: Date | undefined, defaultValue: string = '') => {
  if (!date) {
    return defaultValue;
  }
  return new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit' });
};

const CalendarEventCard = ({ event, onClick }: CalendarEventCardProps) => {
  const handleClick = useCallback(() => event && onClick(event), [onClick, event]);

  return (
    <ContributeCard onClick={handleClick}>
      <EventCardHeader event={event} />
      <CardDetails transparent>
        <CardDescription>{event.profile?.description!}</CardDescription>
        <CardTags tags={event.profile?.tagset?.tags ?? []} paddingX={1.5} marginY={1} />
      </CardDetails>
      <CardFooter>
        {event.createdDate && <CardFooterDate date={event.createdDate} />}
        <MessageCounter commentsCount={event.comments?.commentsCount} />
      </CardFooter>
    </ContributeCard>
  );
};

export default CalendarEventCard;
