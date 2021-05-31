import { RegistrationFlow } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import KratosUI from '../components/Authentication/KratosUI';
import { useKratosClient } from '../hooks/useKratosClient';

interface RegisterPageProps {
  flow: string;
}
// interface FormValues {
//   firstName: string;
//   lastName: string;
//   email: string;
//   password: string;
//   confirmPassword: string;
//   acceptTerms: boolean;
// }

export const RegisterPage: FC<RegisterPageProps> = ({ flow }) => {
  const [registrationFlow, setregistrationFlow] = useState<RegistrationFlow>();
  const kratos = useKratosClient();

  useEffect(() => {
    if (flow && kratos) {
      kratos.getSelfServiceRegistrationFlow(flow).then(({ status, data: flow, ..._response }) => {
        if (status !== 200) {
          console.error(flow);
        }
        setregistrationFlow(flow);
      });
    }
  }, [flow]);

  return (
    <Container fluid={'sm'}>
      <KratosUI flow={registrationFlow} />
    </Container>
  );
};
export default RegisterPage;
