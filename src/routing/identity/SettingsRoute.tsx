import React, { FC } from 'react';
import SettingsPage from '../../core/auth/authentication/pages/SettingsPage';
import { useQueryParams } from '../../hooks';

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
