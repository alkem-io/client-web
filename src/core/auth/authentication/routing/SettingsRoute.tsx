import { useQueryParams } from '@/core/routing/useQueryParams';
import SettingsPage from '../pages/SettingsPage';

export const SettingsRoute = () => {
  const params = useQueryParams();
  const flow = params.get('flow');

  if (!flow) {
    window.location.replace('/');
    return null;
  }

  return <SettingsPage flow={flow} />;
};

export default SettingsRoute;
