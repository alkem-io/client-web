import { Formik } from 'formik';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { Alert, Col, Container, Form, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import InputField from '../components/Admin/Common/InputField';
import Button from '../components/core/Button';
import Delimeter from '../components/core/Delimeter';
import Typography from '../components/core/Typography';
import { AuthenticationProviderConfig } from '../generated/graphql';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useDemoAuth } from '../hooks/useDemoAuth';
import { useUpdateNavigation } from '../hooks/useNavigation';

interface LoginPageProps {
  providers: AuthenticationProviderConfig[];
  logo?: string;
  redirect?: string;
}

const validationSchema = yup.object().shape({
  username: yup.string().required('Please enter your email address.'),
  password: yup.string().required('Please enter your password.'),
});

const initialValues = {
  username: '',
  password: '',
};

export const LoginPage: FC<LoginPageProps> = ({ providers, logo, redirect }) => {
  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });
  const history = useHistory();
  const dispatch = useDispatch();
  const { authenticate } = useAuthenticate();
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

  const demoProvider = useMemo(
    () => providers.filter(x => x.enabled).find(x => x.config.__typename === 'DemoAuthProviderConfig'),
    [providers]
  );

  const nonDemoProviders = useMemo(
    () => providers.filter(x => x.config.__typename !== 'DemoAuthProviderConfig' && x.enabled),
    [providers]
  );

  return (
    <Container fluid={'sm'}>
      {logo && (
        <Row className={'justify-content-center'}>
          <Col sm={2}>
            <img src={logo} className={'img-fluid'} alt={''} />
          </Col>
        </Row>
      )}
      <Row className={'justify-content-center'}>
        <Col sm={4}>
          <Typography variant={'h3'} className={'mt-4 mb-4'}>
            Sign in
          </Typography>
          {nonDemoProviders.map((provider, index) => {
            return (
              <Button
                key={index}
                variant="primary"
                small
                block
                onClick={() => authenticate().then(() => history.push('/'))}
                className={'d-flex text-center justify-content-center'}
                disabled={!provider.enabled}
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
                          disabled={isSubmitting || !demoProvider.enabled}
                          value={values.username}
                          autoComplete={'username'}
                        />
                      </Form.Row>
                      <Form.Row>
                        <InputField
                          name={'password'}
                          title={'Password'}
                          disabled={isSubmitting || !demoProvider.enabled}
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
                          disabled={isSubmitting || !demoProvider.enabled}
                          small
                        >
                          Sign in
                        </Button>
                      </div>
                    </Form>
                  );
                }}
              </Formik>
              <div className={'mt-4'}>
                <Delimeter />
                <Typography variant={'h5'} className={'mb-2'}>
                  Don't have an account?
                </Typography>
                <Button variant="primary" type={'submit'} small block onClick={() => history.push('/register')}>
                  Sign up
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
