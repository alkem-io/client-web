import { Box, FormControlLabel, Skeleton, Switch, useTheme } from '@mui/material';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { groupBy, sortBy, times } from 'lodash';
import { JourneyLocation } from '../../../../common/utils/urlBuilders';
import { useHubDashboardCalendarEventsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeaderWithDialogAction from '../../../../core/ui/content/PageContentBlockHeaderWithDialogAction';
import { gutters } from '../../../../core/ui/grid/utils';
import { Caption, Text } from '../../../../core/ui/typography';
import CalendarEventView from '../../../timeline/calendar/views/CalendarEventView';
import { EntityPageSection } from '../../layout/EntityPageSection';
import PageContentBlockFooter from '../../../../core/ui/content/PageContentBlockFooter';
import FullCalendar, { INTERNAL_DATE_FORMAT } from '../../../timeline/calendar/components/FullCalendar';
import { HIGHLIGHT_PARAM_NAME } from '../../../timeline/calendar/views/CalendarEventsList';

const MAX_NUMBER_OF_EVENTS = 3;

const CalendarSkeleton = () => {
  const theme = useTheme();

  return (
    <Box>
      {times(3, index => (
        <Box key={index} display="flex" gap={gutters()} marginBottom={gutters()}>
          <Skeleton variant="circular" width={gutters(2)(theme)} height={gutters(2)(theme)} />
          <Skeleton height={gutters(2)(theme)} sx={{ flexGrow: 1 }} />
        </Box>
      ))}
    </Box>
  );
};

export interface DashboardCalendarSectionProps {
  journeyLocation: JourneyLocation | undefined;
}

const DashboardCalendarSection: FC<DashboardCalendarSectionProps> = ({ journeyLocation }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isCalendarView, setCalendarView] = useState(false);

  const { data, loading } = useHubDashboardCalendarEventsQuery({
    variables: { hubId: journeyLocation?.hubNameId! },
    skip: !journeyLocation || !journeyLocation.hubNameId,
  });

  // TODO: Move this to serverside
  const allEvents = useMemo(() => sortBy(data?.hub.timeline?.calendar.events ?? [], event => event.startDate), [data]);
  const events = useMemo(() => {
    const eventGroups = groupBy(allEvents, event =>
      dayjs(event.startDate).isBefore(dayjs().startOf('day')) ? 'past' : 'future'
    );
    return [
      ...sortBy(eventGroups['future'], event => dayjs(event.startDate).valueOf()),
      ...sortBy(eventGroups['past'], event => -dayjs(event.startDate).valueOf()),
    ].slice(0, MAX_NUMBER_OF_EVENTS);
  }, [allEvents]);

  const openDialog = () => navigate(`${EntityPageSection.Dashboard}/calendar`);

  const onClickHighlightedDate = (date: Date) => {
    // Clicking on a marked date highlights events on the list
    navigate(
      `${EntityPageSection.Dashboard}/calendar?${HIGHLIGHT_PARAM_NAME}=${dayjs(date).format(INTERNAL_DATE_FORMAT)}`
    );
  };

  return (
    <PageContentBlock disableGap={isCalendarView}>
      <PageContentBlockHeaderWithDialogAction title={t('common.events')} onDialogOpen={openDialog} />
      <Box display="flex" flexDirection="column" gap={gutters()}>
        {loading && <CalendarSkeleton />}
        {!loading && isCalendarView && (
          <FullCalendar events={allEvents} onClickHighlightedDate={onClickHighlightedDate} />
        )}
        {!loading && !isCalendarView && (
          <>
            {events.length === 0 && <Text>{t('calendar.no-data')}</Text>}
            {events.map(event => (
              <CalendarEventView key={event.id} {...event} />
            ))}
          </>
        )}
      </Box>
      <PageContentBlockFooter>
        <FormControlLabel
          control={<Switch size="small" value={isCalendarView} onChange={(e, checked) => setCalendarView(checked)} />}
          label={<Caption>{t('calendar.show-calendar')}</Caption>}
        />
      </PageContentBlockFooter>
    </PageContentBlock>
  );
};

export default DashboardCalendarSection;
