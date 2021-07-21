import { SelfServiceRegistrationFlow } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import KratosUI from '../../components/Authentication/KratosUI';
import Button from '../../components/core/Button';
import Delimiter from '../../components/core/Delimiter';
import Loading from '../../components/core/Loading';
import Typography from '../../components/core/Typography';
import { usePlatformConfigurationQuery } from '../../generated/graphql';
import { useKratosClient } from '../../hooks/useKratosClient';
import AuthenticationLayout from '../../layout/AuthenticationLayout';
import { AUTH_LOGIN_PATH } from '../../models/Constants';

interface RegisterPageProps {
  flow?: string;
}

export const RegistrationPage: FC<RegisterPageProps> = ({ flow }) => {
  const [registrationFlow, setRegistrationFlow] = useState<SelfServiceRegistrationFlow>();
  const kratos = useKratosClient();
  const history = useHistory();
  const { t } = useTranslation();

  useEffect(() => {
    if (flow && kratos) {
      kratos
        .getSelfServiceRegistrationFlow(flow)
        .then(({ status, data: flow, ..._response }) => {
          if (status !== 200) {
            console.error(flow);
          }
          setRegistrationFlow(flow);
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
  }, [flow]);

  const { data, loading } = usePlatformConfigurationQuery();
  const platform = data?.configuration.platform;

  if (!flow) {
    window.location.replace('/self-service/registration/browser');
  }

  if (!registrationFlow || loading) return <Loading text={'Loading flow'} />;

  return (
    <AuthenticationLayout>
      <Row className={'d-flex justify-content-center'}>
        <Col sm={4}>
          <Typography variant={'h3'} className={'mt-4 mb-4 text-center'}>
            {t('pages.registration.header')}
          </Typography>
          <KratosUI flow={registrationFlow} termsURL={platform?.terms} privacyURL={platform?.privacy} />
          <Delimiter />
          <Typography variant={'h5'} className={'mb-2'}>
            {t('pages.registration.login')}
          </Typography>
          <Button variant="primary" type={'submit'} small block onClick={() => history.push(AUTH_LOGIN_PATH)}>
            {t('authentication.sign-in')}
          </Button>
        </Col>
      </Row>
    </AuthenticationLayout>
  );
};
export default RegistrationPage;
