import { LoginFlow } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import KratosUI from '../components/Authentication/KratosUI';
import Loading from '../components/core/Loading';
import { useKratosClient } from '../hooks/useKratosClient';

interface LoginPageProps {
  flow: string;
  redirect?: string;
}

export const LoginPage: FC<LoginPageProps> = ({ flow }) => {
  const [loginFlow, setLoginFlow] = useState<LoginFlow>();
  const kratos = useKratosClient();

  useEffect(() => {
    if (flow && kratos) {
      kratos
        .getSelfServiceLoginFlow(flow)
        .then(({ status, data: flow, ..._response }) => {
          if (status !== 200) {
            console.error(flow);
          }
          setLoginFlow(flow);
        })
        .catch(e => {
          debugger;
          console.log(e);
        });
    }
  }, [flow, kratos]);

  if (!loginFlow) return <Loading text={'Loading flow'} />;

  return (
    <Container fluid={'sm'}>
      <KratosUI flow={loginFlow} />
    </Container>
  );
};

export default LoginPage;
