import { useQueryParams } from '@/core/routing/useQueryParams';
import { AUTH_RESET_PASSWORD_REQUEST } from '../constants/authentication.constants';
import RecoveryPage from '../pages/RecoveryPage';

export const RecoveryRoute = () => {
  const params = useQueryParams();
  const flow = params.get('flow');

  if (!flow) {
    window.location.replace(AUTH_RESET_PASSWORD_REQUEST);
    return null;
  }

  return <RecoveryPage flow={flow} />;
};

export default RecoveryRoute;
