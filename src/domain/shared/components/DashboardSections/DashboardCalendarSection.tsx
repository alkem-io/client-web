import { Box, FormControlLabel, Skeleton, Switch, useTheme } from '@mui/material';
import { FC, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { groupBy, sortBy, times } from 'lodash';
import { JourneyLocation } from '../../../../common/utils/urlBuilders';
import {
  useChallengeDashboardCalendarEventsQuery,
  useOpportunityDashboardCalendarEventsQuery,
  useSpaceDashboardCalendarEventsQuery,
} from '../../../../core/apollo/generated/apollo-hooks';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeaderWithDialogAction from '../../../../core/ui/content/PageContentBlockHeaderWithDialogAction';
import { gutters } from '../../../../core/ui/grid/utils';
import { Caption, Text } from '../../../../core/ui/typography';
import CalendarEventView from '../../../timeline/calendar/views/CalendarEventView';
import { EntityPageSection } from '../../layout/EntityPageSection';
import PageContentBlockFooter from '../../../../core/ui/content/PageContentBlockFooter';
import FullCalendar, { INTERNAL_DATE_FORMAT } from '../../../timeline/calendar/components/FullCalendar';
import { HIGHLIGHT_PARAM_NAME } from '../../../timeline/calendar/CalendarDialog';
import { useQueryParams } from '../../../../core/routing/useQueryParams';

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
  const urlQueryParams = useQueryParams();

  const [isCalendarView, setCalendarView] = useState(false);

  const spaceResults = useSpaceDashboardCalendarEventsQuery({
    variables: { spaceId: journeyLocation?.spaceNameId! },
    skip:
      !journeyLocation ||
      !journeyLocation.spaceNameId ||
      !!journeyLocation.challengeNameId ||
      !!journeyLocation.opportunityNameId,
  });

  const challengeResults = useChallengeDashboardCalendarEventsQuery({
    variables: { spaceId: journeyLocation?.spaceNameId!, challengeId: journeyLocation?.challengeNameId! },
    skip: !journeyLocation || !journeyLocation.spaceNameId || !journeyLocation.challengeNameId,
  });

  const opportunityResults = useOpportunityDashboardCalendarEventsQuery({
    variables: { spaceId: journeyLocation?.spaceNameId!, opportunityId: journeyLocation?.opportunityNameId! },
    skip: !journeyLocation || !journeyLocation.spaceNameId || !journeyLocation.opportunityNameId,
  });

  const activeResults = journeyLocation?.opportunityNameId
    ? opportunityResults
    : journeyLocation?.challengeNameId
    ? challengeResults
    : spaceResults;
  const { data, loading } = activeResults;
  let collaboration;
  if (journeyLocation?.opportunityNameId) {
    collaboration = opportunityResults.data?.space.opportunity?.collaboration;
  } else if (journeyLocation?.challengeNameId) {
    collaboration = challengeResults.data?.space.challenge?.collaboration;
  } else {
    collaboration = spaceResults.data?.space.collaboration;
  }

  // TODO: Move this to serverside
  const allEvents = useMemo(
    () => sortBy(collaboration?.timeline?.calendar.events ?? [], event => event.startDate),
    [data]
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

  const openDialog = () => navigate(`${EntityPageSection.Dashboard}/calendar`);

  const onClickHighlightedDate = (date: Date) => {
    // Clicking on a marked date highlights events on the list
    const nextUrlParams = new URLSearchParams(urlQueryParams.toString());
    nextUrlParams.set(HIGHLIGHT_PARAM_NAME, dayjs(date).format(INTERNAL_DATE_FORMAT));
    navigate(`${EntityPageSection.Dashboard}/calendar?${nextUrlParams}`);
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
