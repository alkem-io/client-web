import React, { FC } from 'react';
import { useQueryParams } from '../../hooks/useQueryParams';
import RegistrationPage from '../../pages/RegistrationPage';

export const RegistrationRoute: FC = () => {
  const params = useQueryParams();
  const flow = params.get('flow');

  if (!flow) {
    window.location.replace('/self-service/registration/browser');
    return null;
  }

  return <RegistrationPage flow={flow} />;
};
export default RegistrationRoute;
