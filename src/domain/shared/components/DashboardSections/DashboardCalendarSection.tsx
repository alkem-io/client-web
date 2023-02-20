import { Box, Skeleton } from '@mui/material';
import { FC, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { sortBy } from 'lodash';
import { JourneyLocation } from '../../../../common/utils/urlBuilders';
import { useHubDashboardCalendarEventsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeaderWithDialogAction from '../../../../core/ui/content/PageContentBlockHeaderWithDialogAction';
import { gutters } from '../../../../core/ui/grid/utils';
import { Text } from '../../../../core/ui/typography';
import CalendarEventView from '../../../timeline/calendar/views/CalendarEventView';
import { EntityPageSection } from '../../layout/EntityPageSection';

const MAX_NUMBER_OF_EVENTS = 3;

export interface DashboardCalendarSectionProps {
  journeyLocation: JourneyLocation | undefined;
}

const DashboardCalendarSection: FC<DashboardCalendarSectionProps> = ({ journeyLocation }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, loading } = useHubDashboardCalendarEventsQuery({
    variables: { hubId: journeyLocation?.hubNameId! },
    skip: !journeyLocation || !journeyLocation.hubNameId,
  });

  // TODO: Move this to serverside
  const events = useMemo(() => {
    const mostRecent = sortBy(data?.hub.timeline?.calendar.events ?? [], event => -dayjs(event.startDate)).slice(
      0,
      MAX_NUMBER_OF_EVENTS
    ); // Get the first N elements
    return sortBy(mostRecent, event => dayjs(event.startDate).valueOf());
  }, [data]);

  const openDialog = () => navigate(`${EntityPageSection.Dashboard}/calendar`);

  return (
    <PageContentBlock>
      <PageContentBlockHeaderWithDialogAction title={t('dashboard-calendar-section.title')} onDialogOpen={openDialog} />
      <Box display="flex" flexDirection="column" gap={gutters()}>
        {loading && <Skeleton />}
        {!loading && events.length === 0 && <Text>{t('dashboard-calendar-section.no-data')}</Text>}
        {!loading && events.map(event => <CalendarEventView key={event.id} {...event} />)}
      </Box>
    </PageContentBlock>
  );
};

export default DashboardCalendarSection;
