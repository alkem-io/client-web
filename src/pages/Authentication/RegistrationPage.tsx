import { RegistrationFlow } from '@ory/kratos-client';
import React, { FC, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import Grid from '@material-ui/core/Grid';
import KratosUI from '../../components/Authentication/KratosUI';
import Button from '../../components/core/Button';
import Delimiter from '../../components/core/Delimiter';
import Loading from '../../components/core/Loading/Loading';
import Typography from '../../components/core/Typography';
import { useConfig } from '../../hooks';
import { useKratosClient } from '../../hooks';
import AuthenticationLayout from '../../components/composite/layout/AuthenticationLayout';
import { AUTH_LOGIN_PATH } from '../../models/constants';

interface RegisterPageProps {
  flow?: string;
}

export const RegistrationPage: FC<RegisterPageProps> = ({ flow }) => {
  const [registrationFlow, setRegistrationFlow] = useState<RegistrationFlow>();
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

  const { platform, loading } = useConfig();

  if (!flow) {
    window.location.replace('/identity/ory/kratos/public/self-service/registration/browser');
  }

  if (!registrationFlow || loading) return <Loading text={'Loading flow'} />;

  return (
    <AuthenticationLayout>
      <Grid container spacing={2} justifyContent={'center'}>
        <Grid item sm={4}>
          <Typography variant={'h3'} className={'mt-4 mb-4 text-center'}>
            {t('pages.registration.header')}
          </Typography>
          <KratosUI flow={registrationFlow} termsURL={platform?.terms} privacyURL={platform?.privacy} />
          <Delimiter />
          <Typography variant={'h5'}>{t('pages.registration.login')}</Typography>
          <Button
            variant="primary"
            type={'submit'}
            small
            block
            onClick={() => history.push(AUTH_LOGIN_PATH)}
            text={t('authentication.sign-in')}
          />
        </Grid>
      </Grid>
    </AuthenticationLayout>
  );
};
export default RegistrationPage;
