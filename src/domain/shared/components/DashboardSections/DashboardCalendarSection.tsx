import { Box, Skeleton } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { JourneyLocation } from '../../../../common/utils/urlBuilders';
import { useHubDashboardCalendarEventsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeaderWithDialogAction from '../../../../core/ui/content/PageContentBlockHeaderWithDialogAction';
import { gutters } from '../../../../core/ui/grid/utils';
import { Text } from '../../../../core/ui/typography';
import CalendarEventView from '../../../timeline/calendar/views/CalendarEventView';

export interface DashboardCalendarsSectionProps {
  journeyLocation: JourneyLocation | undefined;
}

const DashboardCalendarsSection: FC<DashboardCalendarsSectionProps> = ({ journeyLocation }) => {
  const { t } = useTranslation();

  const { data, loading } = useHubDashboardCalendarEventsQuery({
    variables: { hubId: journeyLocation!.hubNameId! },
    skip: !journeyLocation || !journeyLocation.hubNameId,
  });
  const events = data?.hub.timeline?.calendar.events ?? [];

  const openDialog = () => {};

  // TODO
  return (
    <PageContentBlock>
      <PageContentBlockHeaderWithDialogAction
        title={t('dashboard-calendar-section.title')}
        onDialogOpen={() => openDialog()}
      />
      <Box display="flex" flexDirection="column" gap={gutters()}>
        {loading && <Skeleton />}
        {!loading && events.length === 0 && <Text>{t('dashboard-calendar-section.no-data')}</Text>}
        {!loading &&
          events.map(event =>
            <CalendarEventView {...event} />
          )
        }
      </Box>
    </PageContentBlock>
  );
};

export default DashboardCalendarsSection;
