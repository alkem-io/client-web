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
import { EntityPageSection } from '../../layout/EntityPageSection';
import { useNavigate } from 'react-router-dom';

const MAX_NUMBER_OF_EVENTS = 3;
export interface DashboardCalendarSectionProps {
  journeyLocation: JourneyLocation | undefined;
}

const DashboardCalendarSection: FC<DashboardCalendarSectionProps> = ({ journeyLocation }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const { data, loading } = useHubDashboardCalendarEventsQuery({
    variables: { hubId: journeyLocation!.hubNameId!, limit: MAX_NUMBER_OF_EVENTS },
    skip: !journeyLocation || !journeyLocation.hubNameId,
  });
  const events = data?.hub.timeline?.calendar.events ?? [];

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
