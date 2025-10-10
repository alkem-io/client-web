import { Box, FormControlLabel, IconButton, Skeleton, Switch, useTheme } from '@mui/material';
import { Add } from '@mui/icons-material';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import useNavigate from '@/core/routing/useNavigate';
import { groupBy, sortBy, times } from 'lodash';
import { useSpaceCalendarEventsQuery } from '@/core/apollo/generated/apollo-hooks';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeaderWithDialogAction from '@/core/ui/content/PageContentBlockHeaderWithDialogAction';
import { gutters } from '@/core/ui/grid/utils';
import { Caption, Text } from '@/core/ui/typography';
import CalendarEventView from '@/domain/timeline/calendar/views/CalendarEventView';
import PageContentBlockFooter from '@/core/ui/content/PageContentBlockFooter';
import FullCalendar, { INTERNAL_DATE_FORMAT } from '@/domain/timeline/calendar/components/FullCalendar';
import { HIGHLIGHT_PARAM_NAME, INIT_CREATING_EVENT_PARAM } from '@/domain/timeline/calendar/CalendarDialog';
import { useQueryParams } from '@/core/routing/useQueryParams';
import { AuthorizationPrivilege, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import RoundedIcon from '@/core/ui/icon/RoundedIcon';
import { Actions } from '@/core/ui/actions/Actions';

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
  spaceId: string | undefined;
  level: SpaceLevel | undefined;
}

const DashboardCalendarSection = ({ spaceId, level }: DashboardCalendarSectionProps) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const urlQueryParams = useQueryParams();

  const [isCalendarView, setCalendarView] = useState(false);

  const { data: spaceData, loading } = useSpaceCalendarEventsQuery({
    variables: { spaceId: spaceId! },
    skip: !spaceId || level !== SpaceLevel.L0,
  });

  const collaboration = spaceData?.lookup.space?.collaboration;

  // TODO: Move this to server side
  const allEvents = useMemo(
    () => sortBy(collaboration?.timeline?.calendar.events ?? [], event => event.startDate),
    [collaboration]
  );

  const events = useMemo(() => {
    const eventGroups = groupBy(allEvents, event =>
      dayjs(event.startDate).isBefore(dayjs().startOf('day')) ? 'past' : 'future'
    );
    return [
      ...sortBy(eventGroups['future'], event => dayjs(event.startDate).valueOf()),
      ...sortBy(eventGroups['past'], event => -dayjs(event.startDate).valueOf()),
    ].slice(0, MAX_NUMBER_OF_EVENTS);
  }, [allEvents]);

  const openDialog = () => navigate('calendar');

  const openDialogCreateEvent = () => navigate(`calendar?${INIT_CREATING_EVENT_PARAM}=1`);

  const onClickHighlightedDate = (date: Date) => {
    // Clicking on a marked date highlights events on the list
    const nextUrlParams = new URLSearchParams(urlQueryParams.toString());
    nextUrlParams.set(HIGHLIGHT_PARAM_NAME, dayjs(date).format(INTERNAL_DATE_FORMAT));
    navigate(`calendar?${nextUrlParams}`);
  };

  const hasCreatePrivilege = collaboration?.timeline?.calendar.authorization?.myPrivileges?.includes(
    AuthorizationPrivilege.Create
  );

  return events.length > 0 || hasCreatePrivilege ? (
    <PageContentBlock disableGap={isCalendarView}>
      <PageContentBlockHeaderWithDialogAction title={t('common.events')} onDialogOpen={openDialog} />
      <Box display="flex" flexDirection="column" gap={gutters()}>
        {loading && <CalendarSkeleton />}
        {!loading && isCalendarView && (
          <FullCalendar events={allEvents} onClickHighlightedDate={onClickHighlightedDate} />
        )}
        {!loading && !isCalendarView && (
          <>
            {events.length === 0 && <Text>{t('calendar.adminsOnly')}</Text>}
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
        {hasCreatePrivilege && (
          <Actions>
            <IconButton
              onClick={openDialogCreateEvent}
              size="large"
              sx={{
                padding: 0,
                backgroundColor: 'primary.main',
                '&:hover': {
                  backgroundColor: theme => theme.palette.highlight.main,
                  svg: {
                    color: theme => theme.palette.highlight.contrastText,
                  },
                },
              }}
              aria-label={t('calendar.add-event')}
            >
              <RoundedIcon component={Add} size="medium" iconSize="small" color="unset" />
            </IconButton>
          </Actions>
        )}
      </PageContentBlockFooter>
    </PageContentBlock>
  ) : (
    <></>
  );
};

export default DashboardCalendarSection;
