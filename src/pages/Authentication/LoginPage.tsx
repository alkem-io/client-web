import { LoginFlow } from '@ory/kratos-client';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import KratosUI from '../../components/Authentication/KratosUI';
import Loading from '../../components/core/Loading';
import { useKratosClient } from '../../hooks/useKratosClient';
import Typography from '../../components/core/Typography';
import Delimiter from '../../components/core/Delimiter';
import Button from '../../components/core/Button';
import { AUTH_REGISTER_PATH } from '../../models/Constants';
import { useUpdateNavigation } from '../../hooks/useNavigation';

interface LoginPageProps {
  flow: string;
  redirect?: string;
}

export const LoginPage: FC<LoginPageProps> = ({ flow }) => {
  const [loginFlow, setLoginFlow] = useState<LoginFlow>();
  const kratos = useKratosClient();
  const history = useHistory();
  const { t } = useTranslation();

  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });

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
          console.error(e);
        });
    }
  }, [flow, kratos]);

  if (!loginFlow) return <Loading text={'Loading flow'} />;

  return (
    <Container fluid={'sm'}>
      <Row className={'d-flex justify-content-center'}>
        <Col sm={4}>
          <Typography variant={'h3'} className={'mt-4 mb-4'}>
            {t('pages.login.title')}
          </Typography>
          <KratosUI flow={loginFlow} />
          <Delimiter />
          <Typography variant={'h5'} className={'mb-2'}>
            {t('pages.login.demo-provider.question')}
          </Typography>
          <Button variant="primary" type={'submit'} small block onClick={() => history.push(AUTH_REGISTER_PATH)}>
            {t('authentication.sign-up')}
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
