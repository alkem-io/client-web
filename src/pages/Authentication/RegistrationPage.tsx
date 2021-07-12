import { RegistrationFlow } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import KratosUI from '../../components/Authentication/KratosUI';
import Button from '../../components/core/Button';
import Delimiter from '../../components/core/Delimiter';
import Typography from '../../components/core/Typography';
import { usePlatformConfigurationQuery } from '../../generated/graphql';
import { useKratosClient } from '../../hooks/useKratosClient';
import AuthenticationLayout from '../../layout/AuthenticationLayout';
import { AUTH_REGISTER_PATH } from '../../models/Constants';

interface RegisterPageProps {
  flow?: string;
}

export const RegistrationPage: FC<RegisterPageProps> = ({ flow }) => {
  const [registrationFlow, setRegistrationFlow] = useState<RegistrationFlow>();
  const kratos = useKratosClient();
  const history = useHistory();
  const { t } = useTranslation();

  useEffect(() => {
    if (!flow) {
      window.location.replace('/self-service/registration/browser');
    }
    if (flow && kratos) {
      kratos.getSelfServiceRegistrationFlow(flow).then(({ status, data: flow, ..._response }) => {
        if (status !== 200) {
          console.error(flow);
        }
        setRegistrationFlow(flow);
      });
    }
  }, [flow]);

  const { data } = usePlatformConfigurationQuery();
  const platform = data?.configuration.platform;

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
          <Button variant="primary" type={'submit'} small block onClick={() => history.push(AUTH_REGISTER_PATH)}>
            {t('authentication.sign-up')}
          </Button>
        </Col>
      </Row>
    </AuthenticationLayout>
  );
};
export default RegistrationPage;
