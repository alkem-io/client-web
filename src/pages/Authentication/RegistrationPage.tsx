import React, { FC, useEffect } from 'react';
import { Col, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import KratosUI from '../../components/Authentication/KratosUI';
import Button from '../../components/core/Button';
import Delimiter from '../../components/core/Delimiter';
import Loading from '../../components/core/Loading';
import Typography from '../../components/core/Typography';
import { usePlatformConfigurationQuery } from '../../generated/graphql';
import { useKratos } from '../../hooks/useKratos';
import AuthenticationLayout from '../../layout/AuthenticationLayout';
import { AUTH_LOGIN_PATH } from '../../models/Constants';

interface RegisterPageProps {
  flow?: string;
}

export const RegistrationPage: FC<RegisterPageProps> = ({ flow }) => {
  const history = useHistory();
  const { t } = useTranslation();
  const { registrationFlow, getRegistrationFlow, loading } = useKratos();

  useEffect(() => {
    getRegistrationFlow(flow);
  }, [getRegistrationFlow, flow]);

  const { data, loading: loadingPlatform } = usePlatformConfigurationQuery();
  const platform = data?.configuration.platform;

  if (loadingPlatform || loading) return <Loading text={'Loading flow'} />;

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
