import { Configuration, PublicApi, RegistrationFlow } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import KratosUI from '../components/Authentication/KratosUI';

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
      <KratosUI flow={registrationFlow} />
    </Container>
  );
};
export default RegisterPage;
