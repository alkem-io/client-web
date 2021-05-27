import { Configuration, LoginFlow, PublicApi } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Container } from 'react-bootstrap';
import KratosUI from '../../components/Authentication/KratosUI';
import { Loading } from '../../components/core/Loading';
import { useQueryParams } from '../../hooks/useQueryParams';

export const LoginRoute: FC = () => {
  // const dispatch = useDispatch();
  // const ecoverse = useEcoverse();
  const params = useQueryParams();
  // const redirect = params.get('redirect');
  const flow = params.get('flow');
  const [loginFlow, setLoginFlow] = useState<LoginFlow>();

  // const logo = useMemo(
  //   () => ecoverse.ecoverse?.ecoverse.context?.references?.find(ref => ref.name === LOGO_REFERNCE_NAME)?.uri,
  //   [ecoverse]
  // );

  // useEffect(() => {
  //   dispatch(hideLoginNavigation());
  //   return () => {
  //     dispatch(showLoginNavigation());
  //   };
  // }, []);

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

  if (!loginFlow) {
    return <Loading text={'Loading config'} />;
  }

  return (
    <Container fluid={'sm'}>
      <KratosUI flow={loginFlow} />
    </Container>
  );
};

export default LoginRoute;
