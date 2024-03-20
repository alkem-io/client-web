import React, { ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Actions } from '../../../../core/ui/actions/Actions';
import DialogHeader, { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import GridProvider from '../../../../core/ui/grid/GridProvider';
import { gutters } from '../../../../core/ui/grid/utils';
import { BlockSectionTitle, BlockTitle, Caption } from '../../../../core/ui/typography';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';
import CalendarEventCard from './CalendarEventCard';
import Gutters from '../../../../core/ui/grid/Gutters';
import ScrollerWithGradient from '../../../../core/ui/overflow/ScrollerWithGradient';
import PageContentBlockGrid from '../../../../core/ui/content/PageContentBlockGrid';
import { startOfDay } from '../../../../core/utils/time/utils';
import { first, groupBy, sortBy } from 'lodash';
import dayjs from 'dayjs';
import { CalendarEvent } from '../../../../core/apollo/generated/graphql-schema';
import FullCalendar, { INTERNAL_DATE_FORMAT } from '../components/FullCalendar';
import useScrollToElement from '../../../shared/utils/scroll/useScrollToElement';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import { HIGHLIGHT_PARAM_NAME } from '../CalendarDialog';
import { useQueryParams } from '../../../../core/routing/useQueryParams';
import { normalizeLink } from '../../../../core/utils/links';

interface CalendarEventsListProps {
  events: {
    id: string;
    nameID: string;
    startDate?: Date;
    profile: {
      url: string;
      displayName: string;
      description?: string;
    };
  }[];
  highlightedDay?: Date | null;
  actions?: ReactNode;
  onClose?: DialogHeaderProps['onClose'];
}

const CalendarEventsList = ({ events, highlightedDay, actions, onClose }: CalendarEventsListProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const urlQueryParams = useQueryParams();
  const breakpoint = useCurrentBreakpoint();

  const [scrollToElement, scrollTo] = useState<string>();
  const { scrollable } = useScrollToElement(scrollToElement, { enabled: Boolean(scrollToElement), method: 'element' });

  const handleClickOnEvent = (url: string) => {
    navigate(normalizeLink(url));
  };

  const { futureEvents = [], pastEvents = [] } = useMemo(() => {
    const currentDate = startOfDay();
    return groupBy(events, event => {
      const isPast = dayjs(event.startDate).isBefore(currentDate);
      return isPast ? 'pastEvents' : 'futureEvents';
    }) as Record<'pastEvents' | 'futureEvents', CalendarEventsListProps['events']>;
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

  useEffect(() => {
    if (highlightedDay) {
      // Scroll to the first event on highlightedDay:
      const event = first(sortedEvents.filter(event => dayjs(event.startDate).startOf('day').isSame(highlightedDay)));
      scrollTo(event?.nameID);
    }
  }, [highlightedDay, sortedEvents]);

  const onClickHighlightedDate = (date: Date, events: Pick<CalendarEvent, 'nameID'>[]) => {
    if (date) {
      const nextUrlParams = new URLSearchParams(urlQueryParams.toString());
      nextUrlParams.set(HIGHLIGHT_PARAM_NAME, dayjs(date).format(INTERNAL_DATE_FORMAT));
      navigate(`${EntityPageSection.Dashboard}/calendar?${nextUrlParams}`, { replace: true });
    }
    if (events.length > 0) {
      // Scroll again in case url hasn't changed but user has scrolled out of the view
      scrollTo(events[0].nameID);
    }
  };
  return (
    <GridProvider columns={12}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>{t('common.events')}</BlockTitle>
      </DialogHeader>
      <Gutters row={!['xs', 'sm'].includes(breakpoint)} minHeight={0} flexGrow={1} paddingRight={0} paddingTop={0}>
        <FullCalendar
          events={sortedEvents}
          sx={{ flexGrow: 2, minWidth: gutters(15) }}
          onClickHighlightedDate={onClickHighlightedDate}
          selectedDate={highlightedDay}
        />
        <Gutters minHeight={0} flexGrow={5}>
          <ScrollerWithGradient orientation="vertical" minHeight={0} flexGrow={1} onScroll={() => scrollTo(undefined)}>
            <PageContentBlockGrid paddingBottom={gutters(4)}>
              {sortedFutureEvents.length === 0 && <Caption width="100%">{t('calendar.no-upcoming-events')}</Caption>}
              {sortedFutureEvents.map(event => (
                <CalendarEventCard
                  key={event.id}
                  ref={scrollable(event.nameID)}
                  highlighted={dayjs(event.startDate).startOf('day').isSame(highlightedDay)}
                  event={event}
                  onClick={() => handleClickOnEvent(event.profile.url)}
                />
              ))}
              {sortedPastEvents.length > 0 && (
                <>
                  <BlockSectionTitle>{t('calendar.past-events')}</BlockSectionTitle>
                  {sortedPastEvents.map(event => (
                    <CalendarEventCard
                      key={event.id}
                      ref={scrollable(event.nameID)}
                      highlighted={dayjs(event.startDate).startOf('day').isSame(highlightedDay)}
                      event={event}
                      onClick={() => handleClickOnEvent(event.profile.url)}
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
