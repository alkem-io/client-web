import { Skeleton } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { JourneyLocation } from '../../../../common/utils/urlBuilders';
import { useHubCalendarEventsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { Text } from '../../../../core/ui/typography';

export interface DashboardCalendarsSectionProps {
  journeyLocation: JourneyLocation | undefined;
}

const DashboardCalendarsSection: FC<DashboardCalendarsSectionProps> = ({ journeyLocation }) => {
  const { t } = useTranslation();

  const { data, loading } = useHubCalendarEventsQuery({
    variables: { hubId: journeyLocation!.hubNameId! },
    skip: !journeyLocation || !journeyLocation.hubNameId,
  });
  const events = data?.hub.timeline?.calendar?.events || [];

  // TODO
  return (
    <PageContentBlock>
      <PageContentBlockHeader title={t('dashboard-calendar-section.title')} />
      {loading && <Skeleton />}
      {!loading && events.length === 0 && <Text>{t('dashboard-calendar-section.no-data')}</Text>}
      {!loading &&
        events.map(event => {
          return (
            <>
              <p>
                {event.displayName} {event.startDate}
              </p>
            </>
          );
        })}
    </PageContentBlock>
  );
};

export default DashboardCalendarsSection;
