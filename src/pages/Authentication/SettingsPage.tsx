import React, { FC, useEffect } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import KratosUI from '../../components/Authentication/KratosUI';
import Loading from '../../components/core/Loading';
import Typography from '../../components/core/Typography';
import { useKratos } from '../../hooks/useKratos';

interface RegisterPageProps {
  flow: string;
}

export const SettingsPage: FC<RegisterPageProps> = ({ flow }) => {
  const { t } = useTranslation();

  const { settingsFlow, getSettingsFlow, loading } = useKratos();

  useEffect(() => {
    getSettingsFlow(flow);
  }, [getSettingsFlow, flow]);

  if (loading) return <Loading text={'Loading flow'} />;

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
