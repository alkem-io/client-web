import React, { ReactNode, useMemo } from 'react';
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
import { CalendarEventDetailsFragment } from '../../../../core/apollo/generated/graphql-schema';

interface CalendarEventsListProps {
  events: CalendarEventCardData[];
  onClose?: DialogHeaderProps['onClose'];
  actions?: ReactNode;
}

const CalendarEventsList = ({ events, actions, onClose }: CalendarEventsListProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
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

  const sortedFutureEvents = useMemo(() => {
    return sortBy(futureEvents, event => dayjs(event.startDate).valueOf());
  }, [futureEvents]);

  const sortedPastEvents = useMemo(() => {
    return sortBy(pastEvents, event => -dayjs(event.startDate));
  }, [pastEvents]);

  return (
    <GridProvider columns={12}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>{t('common.events')}</BlockTitle>
      </DialogHeader>
      <Gutters minHeight={0} flexGrow={1}>
        <ScrollerWithGradient orientation="vertical" minHeight={0} flexGrow={1}>
          <PageContentBlockGrid paddingBottom={gutters(4)}>
            {sortedFutureEvents.length === 0 && <Caption width="100%">{t('calendar.no-upcoming-events')}</Caption>}
            {sortedFutureEvents.map(event => (
              <CalendarEventCard key={event.id} event={event} onClick={() => handleClickOnEvent(event.nameID)} />
            ))}
            {sortedPastEvents.length > 0 && (
              <>
                <BlockSectionTitle>{t('calendar.past-events')}</BlockSectionTitle>
                {sortedPastEvents.map(event => (
                  <CalendarEventCard key={event.id} event={event} onClick={() => handleClickOnEvent(event.nameID)} />
                ))}
              </>
            )}
          </PageContentBlockGrid>
        </ScrollerWithGradient>
        <Actions justifyContent="space-between" sx={{ position: 'absolute', bottom: gutters(), right: gutters() }}>
          {actions}
        </Actions>
      </Gutters>
    </GridProvider>
  );
};

export default CalendarEventsList;
