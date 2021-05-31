import { Configuration, LoginFlow, PublicApi } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import KratosUI from '../components/Authentication/KratosUI';
import Loading from '../components/core/Loading';

interface LoginPageProps {
  flow: string;
  redirect?: string;
}

export const LoginPage: FC<LoginPageProps> = ({ flow }) => {
  const [loginFlow, setLoginFlow] = useState<LoginFlow>();

  useEffect(() => {
    if (flow) {
      const kratos = new PublicApi(new Configuration({ basePath: 'http://localhost:4433/' }));
      kratos.getSelfServiceLoginFlow(flow).then(({ status, data: flow, ..._response }) => {
        if (status !== 200) {
          console.error(flow);
        }
        setLoginFlow(flow);
        console.log(flow);
      });
    }
  }, [flow]);

  if (!loginFlow) return <Loading text={'Loading flow'} />;

  return (
    <Container fluid={'sm'}>
      <KratosUI flow={loginFlow} />
    </Container>
  );
};

export default LoginPage;
