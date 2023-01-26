import React from 'react';
import { useNavigate } from 'react-router-dom';
import CardsLayout from '../../../../core/ui/card/CardsLayout/CardsLayout';
import { CONTRIBUTE_CARD_COLUMNS } from '../../../../core/ui/card/ContributeCard';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import CalendarEventCard, { CalendarEventCardData } from './CalendarEventCard';

interface CalendarEventsListProps {
  events: CalendarEventCardData[];
}

const CalendarEventsList = ({ events }: CalendarEventsListProps) => {
  const navigate = useNavigate();
  const handleClickOnEvent = (nameId: string) => {
    navigate(`${EntityPageSection.Dashboard}/calendar/${nameId}`);
  };

  return (
    <GridProvider columns={CONTRIBUTE_CARD_COLUMNS}>
      <CardsLayout items={events} disablePadding cards={false}>
        {event => <CalendarEventCard key={event.id} event={event} onClick={() => handleClickOnEvent(event.nameID)} />}
      </CardsLayout>
    </GridProvider>
  );
};

export default CalendarEventsList;
