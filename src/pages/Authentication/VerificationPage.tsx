import { SelfServiceVerificationFlow } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import KratosUI from '../../components/Authentication/KratosUI';
import Loading from '../../components/core/Loading';
import Typography from '../../components/core/Typography';
import { handleFlowError, useKratosClient } from '../../hooks/useKratosClient';

interface RegisterPageProps {
  flow?: string;
}

export const VerificationPage: FC<RegisterPageProps> = ({ flow }) => {
  const [verificationFlow, setVerificationFlow] = useState<SelfServiceVerificationFlow>();
  const kratos = useKratosClient();
  const { t } = useTranslation();

  useEffect(() => {
    if (flow && kratos) {
      kratos
        .getSelfServiceVerificationFlow(flow)
        .then(({ status, data: flow, ..._response }) => {
          if (status !== 200) {
            console.error(flow);
          }
          setVerificationFlow(flow);
        })
        .catch(handleFlowError);
    }
  }, [flow]);

  if (!flow) {
    window.location.replace('/self-service/verification/browser');
    return null;
  }

  if (!verificationFlow) return <Loading text={'Loading flow'} />;

  return (
    <Container fluid={'sm'}>
      <Row className={'d-flex justify-content-center'}>
        <Col sm={4}>
          <Typography variant={'h3'} className={'mt-4 mb-4'}></Typography>
          {t('pages.verification.header')}
          <KratosUI flow={verificationFlow} />
        </Col>
      </Row>
    </Container>
  );
};
export default VerificationPage;
