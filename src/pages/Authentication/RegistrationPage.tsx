import { RegistrationFlow } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useKratosClient } from '../../hooks/useKratosClient';
import KratosUI from '../../components/Authentication/KratosUI';
import Typography from '../../components/core/Typography';
import { Link } from 'react-router-dom';
import Image from '../../components/core/Image';
import { createStyles } from '../../hooks/useTheme';
import { usePlatformConfigurationQuery } from '../../generated/graphql';

const useRegistrationPageStyles = createStyles(theme => ({
  logo: {
    height: theme.shape.spacing(4),
  },
}));
interface RegisterPageProps {
  flow?: string;
}

export const RegistrationPage: FC<RegisterPageProps> = ({ flow }) => {
  const [registrationFlow, setregistrationFlow] = useState<RegistrationFlow>();
  const kratos = useKratosClient();

  const styles = useRegistrationPageStyles();

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
    <Container fluid={'sm'}>
      <Row className={'d-flex justify-content-center'}>
        <Col sm={4}>
          <Link to={'/about'} href="https://alkem.io/about/">
            <Image src="/logo.png" alt="Alkemio" className={styles.logo} />
          </Link>
          <Typography variant={'h3'} className={'mt-4 mb-4'}>
            {t('pages.registration.header')}
          </Typography>
          <KratosUI flow={registrationFlow} termsURL={platform?.terms} privacyURL={platform?.privacy} />
        </Col>
      </Row>
    </Container>
  );
};
export default RegistrationPage;
