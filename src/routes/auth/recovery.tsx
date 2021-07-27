import React, { FC } from 'react';
import { useQueryParams } from '../../hooks';
import RecoveryPage from '../../pages/Authentication/RecoveryPage';

interface RecoveryRouteProps {}

export const RecoveryRoute: FC<RecoveryRouteProps> = () => {
  const params = useQueryParams();
  const flow = params.get('flow');

  if (!flow) {
    window.location.replace('/self-service/recovery/browser');
    return null;
  }

  return <RecoveryPage flow={flow} />;
};
export default RecoveryRoute;
