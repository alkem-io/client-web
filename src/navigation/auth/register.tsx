import React, { FC } from 'react';
import { useQueryParams } from '../../hooks/useQueryParams';
import RegisterPage from '../../pages/RegisterPage';

export const RegisterRoute: FC = () => {
  const params = useQueryParams();
  const flow = params.get('flow');

  if (!flow) {
    window.location.replace('/self-service/registration/browser');
    return null;
  }

  return <RegisterPage flow={flow} />;
};
export default RegisterRoute;
