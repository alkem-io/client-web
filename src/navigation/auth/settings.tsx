import React, { FC } from 'react';
import { useQueryParams } from '../../hooks/useQueryParams';
import SettingsPage from '../../pages/Authentication/SettingsPage';

export const SettingsRoute: FC = () => {
  const params = useQueryParams();
  const flow = params.get('flow');

  if (!flow) {
    window.location.replace('/');
    return null;
  }

  return <SettingsPage flow={flow} />;
};
export default SettingsRoute;
