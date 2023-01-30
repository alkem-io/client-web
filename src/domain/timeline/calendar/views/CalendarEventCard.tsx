import React, { useCallback } from 'react';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardDetails from '../../../../core/ui/card/CardDetails';
import CardDescription from '../../../../core/ui/card/CardDescription';
import CardFooter from '../../../../core/ui/card/CardFooter';
import { CalendarEvent, VisualUriFragment } from '../../../../core/apollo/generated/graphql-schema';
import EventCardHeader from './EventCardHeader';
import { gutters } from '../../../../core/ui/grid/utils';
import { CaptionSmall } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';

type NeededFields =
  | 'id'
  | 'nameID'
  | 'displayName'
  | 'profile'
  | 'type'
  | 'startDate'
  | 'durationMinutes'
  | 'wholeDay'
  | 'multipleDays';
export type CalendarEventCardData = Pick<CalendarEvent, NeededFields> & {
  bannerNarrow?: VisualUriFragment;
  createdBy: { displayName: string };
  createdDate: string | Date; // Apollo says Date while actually it's a string
};
interface CalendarEventCardProps {
  event: CalendarEventCardData;
  onClick: (event: CalendarEventCardData) => void;
}

const CalendarEventCard = ({ event, onClick }: CalendarEventCardProps) => {
  const handleClick = useCallback(() => event && onClick(event), [onClick, event]);
  const { t } = useTranslation();

  return (
    <ContributeCard onClick={handleClick} columns={0}>
      <EventCardHeader event={event} />
      <CardDetails transparent>
        <CardDescription marginLeft={gutters(2.5)} paddingY={0} maxHeight={gutters(3)} overflow="hidden">
          {event.profile?.description!}
        </CardDescription>
      </CardDetails>
      <CardFooter flexDirection="row-reverse">
        <CaptionSmall>{t('buttons.read-more')}</CaptionSmall>
      </CardFooter>
    </ContributeCard>
  );
};

export default CalendarEventCard;
