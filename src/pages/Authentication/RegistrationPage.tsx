import { RegistrationFlow } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useKratosClient } from '../../hooks/useKratosClient';
import KratosUI from '../../components/Authentication/KratosUI';
import Typography from '../../components/core/Typography';

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

  return (
    <Container fluid={'sm'}>
      <Row className={'d-flex justify-content-center'}>
        <Col sm={4}>
          <Typography variant={'h3'} className={'mt-4 mb-4'}>
            {t('pages.registration.header')}
          </Typography>
          <KratosUI flow={registrationFlow} />
        </Col>
      </Row>
    </Container>
  );
};
export default RegistrationPage;
