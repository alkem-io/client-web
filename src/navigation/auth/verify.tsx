import React, { FC } from 'react';
import { useQueryParams } from '../../hooks/useQueryParams';
import VerificationPage from '../../pages/Authentication/VerificationPage';

interface VerifyRouteProps {}

export const VerifyRoute: FC<VerifyRouteProps> = () => {
  const params = useQueryParams();
  const flow = params.get('flow');

  if (!flow) {
    window.location.replace('/'); // TODO [ATS]: Might redirect to invalid page ...
    return null;
  }

  return <VerificationPage flow={flow} />;
};
export default VerifyRoute;
