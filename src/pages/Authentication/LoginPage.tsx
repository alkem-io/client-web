import { LoginFlow } from '@ory/kratos-client';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import KratosUI from '../../components/Authentication/KratosUI';
import Button from '../../components/core/Button';
import Delimiter from '../../components/core/Delimiter';
import Loading from '../../components/core/Loading';
import Typography from '../../components/core/Typography';
import { useKratosClient } from '../../hooks/useKratosClient';
import { useUpdateNavigation } from '../../hooks/useNavigation';
import AuthenticationLayout from '../../layout/AuthenticationLayout';
import { AUTH_REGISTER_PATH } from '../../models/Constants';

interface LoginPageProps {
  flow?: string;
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
        .then(({ status, data: flow }) => {
          if (status !== 200) {
            console.error(flow);
          }
          setLoginFlow(flow);
        })
        .catch(err => {
          const response = err && err.response;
          if (response) {
            if (response.status === 410) {
              window.location.replace(response.data.error.details.redirect_to);
            }
          }
        });
    }
  }, [flow, kratos]);

  if (!flow) {
    window.location.replace('/self-service/login/browser');
  }

  if (!loginFlow) return <Loading text={'Loading flow'} />;

  // Remove resetpassword until the SMTP server is configured correctly
  const resetPassword = <></>;
  // (
  //    <div className={'text-right'}>
  //     <Link to={'/auth/recovery'}>Reset password</Link>
  //    </div>
  //  );

  return (
    <AuthenticationLayout>
      <Row className={'d-flex justify-content-center'}>
        <Col sm={4}>
          <Typography variant={'h3'} className={'mt-4 mb-4 text-center'}>
            {t('pages.login.title')}
          </Typography>
          <KratosUI flow={loginFlow} resetPasswordComponent={resetPassword} />
          <Delimiter />
          <Typography variant={'h5'} className={'mb-2'}>
            {t('pages.login.register')}
          </Typography>
          <Button variant="primary" type={'submit'} small block onClick={() => history.push(AUTH_REGISTER_PATH)}>
            {t('authentication.sign-up')}
          </Button>
        </Col>
      </Row>
    </AuthenticationLayout>
  );
};

export default LoginPage;
