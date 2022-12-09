import React, { FC } from 'react';
import { useQueryParams } from '../../../routing/useQueryParams';
import RecoveryPage from '../pages/RecoveryPage';

interface RecoveryRouteProps {}

export const RecoveryRoute: FC<RecoveryRouteProps> = () => {
  const params = useQueryParams();
  const flow = params.get('flow');

  if (!flow) {
    window.location.replace('/identity/ory/kratos/public/self-service/recovery/browser');
    return null;
  }

  return <RecoveryPage flow={flow} />;
};

export default RecoveryRoute;
