import React, { FC } from 'react';
import { SettingsPageProps } from '../../layout/EntitySettingsLayout/types';

interface CalendarAdminViewProps extends SettingsPageProps {
  hubId: string;
}

const CalendarAdminView: FC<CalendarAdminViewProps> = ({ hubId }) => {

  return (
    <p>Calendar Admin view {hubId}</p>
  );
};

export default CalendarAdminView;
