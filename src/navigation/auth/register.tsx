import { Configuration, PublicApi, RegistrationFlow } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import KratosUI from '../../components/Authentication/KratosUI';
import { useQueryParams } from '../../hooks/useQueryParams';

export const RegisterRoute: FC = () => {
  const [registrationFlow, setregistrationFlow] = useState<RegistrationFlow>();
  const params = useQueryParams();
  const flow = params.get('flow');

  useEffect(() => {
    if (flow) {
      const kratos = new PublicApi(new Configuration({ basePath: 'http://localhost:4433/' }));
      kratos.getSelfServiceRegistrationFlow(flow).then(({ status, data: flow, ..._response }) => {
        if (status !== 200) {
          console.error(flow);
        }
        setregistrationFlow(flow);
        console.log(flow);
      });
    }
  }, [flow]);

  return (
    <Container fluid={'sm'}>
      {' '}
      <KratosUI flow={registrationFlow} />
    </Container>
  );
};
export default RegisterRoute;
