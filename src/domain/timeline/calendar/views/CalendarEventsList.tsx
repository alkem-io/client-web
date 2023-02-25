import React, { ReactNode, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Actions } from '../../../../core/ui/actions/Actions';
import DialogHeader, { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import { gutters } from '../../../../core/ui/grid/utils';
import { BlockSectionTitle, BlockTitle, Caption } from '../../../../core/ui/typography';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import CalendarEventCard, { CalendarEventCardData } from './CalendarEventCard';
import Gutters from '../../../../core/ui/grid/Gutters';
import ScrollerWithGradient from '../../../../core/ui/overflow/ScrollerWithGradient';
import PageContentBlockGrid from '../../../../core/ui/content/PageContentBlockGrid';
import { startOfDay } from '../../../../core/utils/time/utils';
import { groupBy, sortBy } from 'lodash';
import dayjs from 'dayjs';
import { CalendarEvent, CalendarEventDetailsFragment } from '../../../../core/apollo/generated/graphql-schema';
import FullCalendar from '../components/FullCalendar';
import useScrollToElement from '../../../shared/utils/scroll/useScrollToElement';

interface CalendarEventsListProps {
  events: CalendarEventCardData[];
  onClose?: DialogHeaderProps['onClose'];
  actions?: ReactNode;
}

const CalendarEventsList = ({ events, actions, onClose }: CalendarEventsListProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [scrollToElement, scrollTo] = useState<string>();
  const { scrollable } = useScrollToElement(scrollToElement, { enabled: Boolean(scrollToElement), method: 'element' });

  const handleClickOnEvent = (nameId: string) => {
    navigate(`${EntityPageSection.Dashboard}/calendar/${nameId}`);
  };

  const { futureEvents = [], pastEvents = [] } = useMemo(() => {
    const currentDate = startOfDay();
    return groupBy(events, event => {
      const isPast = dayjs(event.startDate).isBefore(currentDate);
      return isPast ? 'pastEvents' : 'futureEvents';
    }) as Record<'pastEvents' | 'futureEvents', CalendarEventDetailsFragment[]>;
  }, [events]);

  const sortedEvents = useMemo(() => {
    return sortBy(events, event => dayjs(event.startDate).valueOf());
  }, [events]);

  const sortedFutureEvents = useMemo(() => {
    return sortBy(futureEvents, event => dayjs(event.startDate).valueOf());
  }, [futureEvents]);

  const sortedPastEvents = useMemo(() => {
    return sortBy(pastEvents, event => -dayjs(event.startDate));
  }, [pastEvents]);

  const onCalendarClickEvents = (events: Partial<CalendarEvent>[]) => {
    // Scroll to the first event on that day
    if (events.length > 0 && events[0].nameID) {
      console.log('scrollTo', events[0].nameID);
      scrollTo(events[0].nameID);
    }
  };

  return (
    <GridProvider columns={12}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>{t('common.events')}</BlockTitle>
      </DialogHeader>
      <Gutters row minHeight={0} flexGrow={1}>
        <FullCalendar events={sortedEvents} sx={{ flex: 2 }} onClickEvents={onCalendarClickEvents} />
        <Gutters minHeight={0} flexGrow={1} sx={{ flex: 5 }}>
          <ScrollerWithGradient orientation="vertical" minHeight={0} flexGrow={1} onScroll={() => scrollTo(undefined)}>
            <PageContentBlockGrid paddingBottom={gutters(4)}>
              {sortedFutureEvents.length === 0 && <Caption>{t('calendar.no-upcoming-events')}</Caption>}
              {sortedFutureEvents.map(event => (
                <CalendarEventCard
                  key={event.id}
                  ref={scrollable(event.nameID)}
                  event={event}
                  onClick={() => handleClickOnEvent(event.nameID)}
                />
              ))}
              {sortedPastEvents.length > 0 && (
                <>
                  <BlockSectionTitle>{t('calendar.past-events')}</BlockSectionTitle>
                  {sortedPastEvents.map(event => (
                    <CalendarEventCard
                      key={event.id}
                      ref={scrollable(event.nameID)}
                      event={event}
                      onClick={() => handleClickOnEvent(event.nameID)}
                    />
                  ))}
                </>
              )}
            </PageContentBlockGrid>
          </ScrollerWithGradient>
          <Actions justifyContent="space-between" sx={{ position: 'absolute', bottom: gutters(), right: gutters() }}>
            {actions}
          </Actions>
        </Gutters>
      </Gutters>
    </GridProvider>
  );
};

export default CalendarEventsList;
