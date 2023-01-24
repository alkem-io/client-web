import { FC } from 'react';
import { SettingsSection } from '../layout/EntitySettingsLayout/constants';
import { SettingsPageProps } from '../layout/EntitySettingsLayout/types';
import CalendarAdminView from '../timeline/calendar/CalendarAdminView';
import HubSettingsLayout from './HubSettingsLayout';

interface HubCalendarPageProps extends SettingsPageProps {
  hubId: string;
}

const HubCalendarPage: FC<HubCalendarPageProps> = ({
  hubId,
}) => {


  return (
    <HubSettingsLayout currentTab={SettingsSection.Calendar}>
      <CalendarAdminView hubId={hubId} />
    </HubSettingsLayout>
  );
};

export default HubCalendarPage;
