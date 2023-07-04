import React, { FC } from 'react';
import { useQueryParams } from '../../../routing/useQueryParams';
import RecoveryPage from '../pages/RecoveryPage';
import { AUTH_RESET_PASSWORD_REQUEST } from '../constants/authentication.constants';

interface RecoveryRouteProps {}

export const RecoveryRoute: FC<RecoveryRouteProps> = () => {
  const params = useQueryParams();
  const flow = params.get('flow');

  if (!flow) {
    window.location.replace(AUTH_RESET_PASSWORD_REQUEST);
    return null;
  }

  return <RecoveryPage flow={flow} />;
};

export default RecoveryRoute;
