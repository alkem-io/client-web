import { Formik } from 'formik';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { Alert, Col, Container, Form, Row } from 'react-bootstrap';
import { useTranslation } from 'react-i18next';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import InputField from '../components/Admin/Common/InputField';
import Button from '../components/core/Button';
import Delimeter from '../components/core/Delimeter';
import Typography from '../components/core/Typography';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useDemoAuth } from '../hooks/useDemoAuth';
import { useUpdateNavigation } from '../hooks/useNavigation';
import { AuthenticationProviderConfig } from '../types/graphql-schema';

interface LoginPageProps {
  providers: AuthenticationProviderConfig[];
  logo?: string;
  redirect?: string;
  ecoverseName?: string;
}

export const LoginPage: FC<LoginPageProps> = ({ providers, logo, redirect, ecoverseName }) => {
  const { t } = useTranslation();
  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });
  const history = useHistory();
  const dispatch = useDispatch();
  const { authenticate, status } = useAuthenticate();
  const { login } = useDemoAuth();
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleLogin = useCallback(
    async (username: string, password: string) => {
      return login(username, password)
        .then(() => {
          if (redirect) history.push(redirect);
          else history.push('/');
        })
        .catch((error: Error) => {
          setErrorMessage(error.message);
        });
    },
    [login, dispatch]
  );

  const validationSchema = yup.object().shape({
    username: yup.string().required(t('pages.login.validations.email')),
    password: yup.string().required(t('pages.login.validations.password')),
  });

  const initialValues = {
    username: '',
    password: '',
  };

  const demoProvider = useMemo(
    () => providers.filter(x => x.enabled).find(x => x.config.__typename === 'DemoAuthProviderConfig'),
    [providers]
  );

  const nonDemoProviders = useMemo(
    () => providers.filter(x => x.config.__typename !== 'DemoAuthProviderConfig' && x.enabled),
    [providers]
  );

  const disabled = useMemo(() => {
    return status === 'authenticating';
  }, [status]);

  return (
    <Container fluid={'sm'}>
      {logo && (
        <Row className={'justify-content-center'}>
          <Col sm={2}>
            <img
              src={logo}
              className={'img-fluid'}
              alt={ecoverseName ? t('pages.login.logo', { ecoverse: ecoverseName }) : ''}
            />
          </Col>
        </Row>
      )}
      <Row className={'justify-content-center'}>
        <Col sm={4}>
          <Typography variant={'h3'} className={'mt-4 mb-4'}>
            {t('pages.login.title')}
          </Typography>
          {nonDemoProviders.map((provider, index) => {
            return (
              <Button
                key={index}
                variant="primary"
                small
                block
                onClick={() => authenticate().then(result => result && history.push('/'))}
                className={'d-flex text-center justify-content-center'}
                disabled={!provider.enabled || disabled}
              >
                {provider.icon && (
                  <img src={provider.icon} style={{ maxHeight: '16px' }} alt={provider.label} className={'mr-2'} />
                )}
                {provider.label}
              </Button>
            );
          })}

          {nonDemoProviders.length > 0 && demoProvider && (
            <div className={'mt-4'}>
              <Delimeter>OR</Delimeter>
            </div>
          )}

          {demoProvider && (
            <>
              <Typography variant={'caption'} className={'mt-4 mb-4'}>
                {demoProvider.label}
              </Typography>
              {errorMessage && (
                <Alert variant={'danger'} onClose={() => setErrorMessage(undefined)} dismissible>
                  {errorMessage}
                </Alert>
              )}
              <Formik
                validationSchema={validationSchema}
                initialValues={initialValues}
                onSubmit={(values, { setSubmitting }) => {
                  handleLogin(values.username, values.password).finally(() => setSubmitting(false));
                }}
              >
                {({ values, handleSubmit, isSubmitting }) => {
                  return (
                    <Form noValidate onSubmit={handleSubmit}>
                      <Form.Row>
                        <InputField
                          name={'username'}
                          title={'Email'}
                          disabled={isSubmitting || !demoProvider.enabled || disabled}
                          value={values.username}
                          autoComplete={'username'}
                        />
                      </Form.Row>
                      <Form.Row>
                        <InputField
                          name={'password'}
                          title={'Password'}
                          disabled={isSubmitting || !demoProvider.enabled || disabled}
                          value={values.password}
                          type={'password'}
                          autoComplete={'password'}
                        />
                      </Form.Row>
                      <div className={'d-flex mt-4'}>
                        <div className={'flex-grow-1'} />
                        <Button
                          variant="primary"
                          type={'submit'}
                          className={'ml-3'}
                          disabled={isSubmitting || !demoProvider.enabled || disabled}
                          small
                        >
                          {t('authentication.sign-in')}
                        </Button>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
              <div className={'mt-4'}>
                <Delimeter />
                <Typography variant={'h5'} className={'mb-2'}>
                  {t('pages.login.demo-provider.question')}
                </Typography>
                <Button
                  variant="primary"
                  type={'submit'}
                  small
                  block
                  onClick={() => history.push('/register')}
                  disabled={disabled}
                >
                  {t('authentication.sign-up')}
                </Button>
              </div>
            </>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default LoginPage;
