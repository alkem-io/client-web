import dayjs from 'dayjs';
import { first, groupBy, sortBy } from 'lodash-es';
import type React from 'react';
import { type ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import useNavigate from '@/core/routing/useNavigate';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { Actions } from '@/core/ui/actions/Actions';
import PageContentBlockGrid from '@/core/ui/content/PageContentBlockGrid';
import DialogHeader, { type DialogHeaderProps } from '@/core/ui/dialog/DialogHeader';
import { useScreenSize } from '@/core/ui/grid/constants';
import GridProvider from '@/core/ui/grid/GridProvider';
import Gutters from '@/core/ui/grid/Gutters';
import { gutters } from '@/core/ui/grid/utils';
import ScrollerWithGradient from '@/core/ui/overflow/ScrollerWithGradient';
import { BlockSectionTitle, BlockTitle, Caption } from '@/core/ui/typography';
import type { Identifiable } from '@/core/utils/Identifiable';
import { startOfDay } from '@/core/utils/time/utils';
import useScrollToElement from '@/domain/shared/utils/scroll/useScrollToElement';
import type { SpaceAboutMinimalUrlModel } from '@/domain/space/about/model/spaceAboutMinimal.model';
import { HIGHLIGHT_PARAM_NAME } from '../CalendarDialog';
import ExportEventsToIcsButton from '../components/ExportEventsToIcsButton';
import FullCalendar, { INTERNAL_DATE_FORMAT } from '../components/FullCalendar';
import CalendarEventCard from './CalendarEventCard';

type CalendarEventsListProps = {
  events: {
    id: string;
    type?: string;
    startDate?: Date;
    durationDays?: number | undefined;
    durationMinutes: number;
    profile: {
      url: string;
      displayName: string;
      description?: string;
    };
    subspace?: {
      about: SpaceAboutMinimalUrlModel;
    };
  }[];
  highlightedDay?: Date | null;
  actions?: ReactNode;
  onClose?: DialogHeaderProps['onClose'];
  dialogTitleId?: string;
};

const CalendarEventsList = ({
  events,
  highlightedDay,
  actions,
  onClose,
  ref,
  dialogTitleId,
}: CalendarEventsListProps & { ref?: React.Ref<HTMLDivElement> }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const urlQueryParams = useQueryParams();
  const { isMediumSmallScreen } = useScreenSize();
  const { pathname } = useLocation();

  const [scrollToElement, scrollTo] = useState<string>();
  const { scrollable } = useScrollToElement(scrollToElement, { enabled: Boolean(scrollToElement), method: 'element' });

  const handleClickOnEvent = (url: string) => {
    navigate(url);
  };

  const { futureEvents = [], pastEvents = [] } = (() => {
    const currentDate = startOfDay();
    return groupBy(events, event => {
      const isPast = dayjs(event.startDate).isBefore(currentDate);
      return isPast ? 'pastEvents' : 'futureEvents';
    }) as Record<'pastEvents' | 'futureEvents', CalendarEventsListProps['events']>;
  })();

  const sortedEvents = (() => {
    return sortBy(events, event => dayjs(event.startDate).valueOf());
  })();

  const sortedFutureEvents = (() => {
    return sortBy(futureEvents, event => dayjs(event.startDate).valueOf());
  })();

  const sortedPastEvents = (() => {
    return sortBy(pastEvents, event => -dayjs(event.startDate));
  })();

  useEffect(() => {
    if (highlightedDay) {
      // Scroll to the first event on highlightedDay:
      const event = first(sortedEvents.filter(event => dayjs(event.startDate).startOf('day').isSame(highlightedDay)));
      scrollTo(event?.id);
    }
  }, [highlightedDay, sortedEvents]);

  const onClickHighlightedDate = (date: Date, events: Identifiable[]) => {
    if (date) {
      const nextUrlParams = new URLSearchParams(urlQueryParams.toString());
      nextUrlParams.set(HIGHLIGHT_PARAM_NAME, dayjs(date).format(INTERNAL_DATE_FORMAT));
      navigate(`${pathname}?${nextUrlParams}`, { replace: true });
    }
    if (events.length > 0) {
      // Scroll again in case url hasn't changed but user has scrolled out of the view
      scrollTo(events[0].id);
    }
  };

  return (
    <GridProvider columns={12}>
      <DialogHeader
        onClose={onClose}
        id={dialogTitleId}
        actions={<>{sortedFutureEvents.length > 0 && <ExportEventsToIcsButton events={sortedFutureEvents} />}</>}
      >
        <BlockTitle>{t('common.events')}</BlockTitle>
      </DialogHeader>
      <Gutters row={!isMediumSmallScreen} minHeight={0} flexGrow={1} paddingRight={0} paddingTop={0}>
        <FullCalendar
          events={sortedEvents}
          sx={{ flex: 2, minWidth: gutters(15) }}
          onClickHighlightedDate={onClickHighlightedDate}
          selectedDate={highlightedDay}
          ref={ref}
        />
        <Gutters minHeight={0} flex={5}>
          <ScrollerWithGradient orientation="vertical" minHeight={0} flexGrow={1} onScroll={() => scrollTo(undefined)}>
            <PageContentBlockGrid paddingBottom={gutters(4)}>
              {sortedFutureEvents.length === 0 && <Caption width="100%">{t('calendar.no-upcoming-events')}</Caption>}
              {sortedFutureEvents.map(event => (
                <CalendarEventCard
                  key={event.id}
                  ref={scrollable(event.id)}
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
                      ref={scrollable(event.id)}
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
