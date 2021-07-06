import { RegistrationFlow } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import KratosUI from '../../components/Authentication/KratosUI';
import Typography from '../../components/core/Typography';
import { usePlatformConfigurationQuery } from '../../generated/graphql';
import { useKratosClient } from '../../hooks/useKratosClient';
import AuthenticationLayout from '../../layout/AuthenticationLayout';

interface RegisterPageProps {
  flow?: string;
}

export const RegistrationPage: FC<RegisterPageProps> = ({ flow }) => {
  const [registrationFlow, setregistrationFlow] = useState<RegistrationFlow>();
  const kratos = useKratosClient();

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
        setregistrationFlow(flow);
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
        </Col>
      </Row>
    </AuthenticationLayout>
  );
};
export default RegistrationPage;
