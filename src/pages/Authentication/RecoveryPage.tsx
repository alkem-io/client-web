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

export const RecoveryPage: FC<RegisterPageProps> = ({ flow }) => {
  const { t } = useTranslation();
  const { recoveryFlow, getRecoveryFlow, loading } = useKratos();

  useEffect(() => {
    getRecoveryFlow(flow);
  }, [getRecoveryFlow, flow]);

  if (loading) return <Loading text={'Loading flow'} />;

  return (
    <Container fluid={'sm'}>
      <Row className={'d-flex justify-content-center'}>
        <Col sm={4}>
          <Typography variant={'h3'} className={'mt-4 mb-4'}>
            {t('pages.recovery.header')}
          </Typography>
          <KratosUI flow={recoveryFlow} />
        </Col>
      </Row>
    </Container>
  );
};
export default RecoveryPage;
