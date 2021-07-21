import { SelfServiceSettingsFlow } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import KratosUI from '../../components/Authentication/KratosUI';
import Loading from '../../components/core/Loading';
import Typography from '../../components/core/Typography';
import { useKratosClient } from '../../hooks/useKratosClient';

interface RegisterPageProps {
  flow: string;
}

export const SettingsPage: FC<RegisterPageProps> = ({ flow }) => {
  const [settingsFlow, setSettingsFlow] = useState<SelfServiceSettingsFlow>();
  const kratos = useKratosClient();

  const { t } = useTranslation();

  useEffect(() => {
    if (flow && kratos) {
      kratos
        .getSelfServiceSettingsFlow(flow)
        .then(({ status, data: flow, ..._response }) => {
          if (status !== 200) {
            console.error(flow);
          }
          setSettingsFlow(flow);
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

  if (!settingsFlow) return <Loading text={'Loading flow'} />;

  return (
    <Container fluid={'sm'}>
      <Row className={'d-flex justify-content-center'}>
        <Col sm={4}>
          <Typography variant={'h3'} className={'mt-4 mb-4'}></Typography>
          {t('pages.settings.header')}
          <KratosUI flow={settingsFlow} />
        </Col>
      </Row>
    </Container>
  );
};
export default SettingsPage;
