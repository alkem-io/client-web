import React, { forwardRef, useCallback } from 'react';
import ContributeCard from '../../../../core/ui/card/ContributeCard';
import CardDetails from '../../../../core/ui/card/CardDetails';
import CardDescription from '../../../../core/ui/card/CardDescription';
import CardFooter from '../../../../core/ui/card/CardFooter';
import { CalendarEventDetailsFragment } from '../../../../core/apollo/generated/graphql-schema';
import EventCardHeader from './EventCardHeader';
import { gutters } from '../../../../core/ui/grid/utils';
import { CaptionSmall } from '../../../../core/ui/typography';
import { useTranslation } from 'react-i18next';

// type NeededFields =
//   | 'id'
//   | 'nameID'
//   | 'profile'
//   | 'type'
//   | 'startDate'
//   | 'durationMinutes'
//   | 'wholeDay'
//   | 'multipleDays';
// export type CalendarEventCardData = Pick<CalendarEvent, NeededFields> & {
//   // bannerNarrow?: VisualUriFragment;
//   createdBy?: { displayName: string };
//   createdDate: string | Date; // Apollo says Date while actually it's a string
// };
export type CalendarEventCardData = CalendarEventDetailsFragment;

interface CalendarEventCardProps {
  event: CalendarEventCardData;
  highlighted?: boolean;
  onClick: (event: CalendarEventCardData) => void;
}

const CalendarEventCard = forwardRef<HTMLDivElement, CalendarEventCardProps>(({ event, highlighted, onClick }, ref) => {
  const handleClick = useCallback(() => event && onClick(event), [onClick, event]);
  const { t } = useTranslation();

  return (
    <ContributeCard onClick={handleClick} columns={0} ref={ref} highlighted={highlighted}>
      <EventCardHeader event={event} />
      <CardDetails transparent>
        <CardDescription marginLeft={gutters(2.5)} paddingY={0} overflow="hidden" overflowGradientColor="paper">
          {event.profile.description!}
        </CardDescription>
      </CardDetails>
      <CardFooter flexDirection="row-reverse">
        <CaptionSmall>{t('buttons.readMore')}</CaptionSmall>
      </CardFooter>
    </ContributeCard>
  );
});

export default CalendarEventCard;
