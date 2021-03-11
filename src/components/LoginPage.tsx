import axios from 'axios';
import { Formik } from 'formik';
import React, { FC, useCallback, useState } from 'react';
import { Alert, Col, Container, Form, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import { AuthenticationProviderConfig, SimpleAuthProviderConfig } from '../generated/graphql';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { AuthenticationResult } from '../models/AuthenticationResult';
import { AUTH_PROVIDER_KEY, AUTH_USER_KEY, PROVIDER_SIMPLE } from '../models/Constants';
import { updateStatus, updateToken } from '../reducers/auth/actions';
import InputField from './Admin/Common/InputField';
import Button from './core/Button';
import Typography from './core/Typography';

interface RegisterPageProps {
  providers: AuthenticationProviderConfig[];
}

const validationSchema = yup.object().shape({
  username: yup.string().required('Please enter your email address.'),
  password: yup.string().required('Please enter your password.'),
});

const initialValues = {
  username: '',
  password: '',
};

export const LoginPage: FC<RegisterPageProps> = ({ providers }) => {
  const history = useHistory();
  const dispatch = useDispatch();
  const { authenticate, resetStore } = useAuthenticate();
  const [errorMessage, setErrorMessage] = useState<string>();

  const login = useCallback(
    async (username: string, password: string) => {
      const provider = providers.find(x => x.config.__typename === 'SimpleAuthProviderConfig');

      const config = provider?.config as SimpleAuthProviderConfig;

      return axios
        .post<AuthenticationResult>(
          config.tokenEndpoint,
          {
            username,
            password,
          },
          {
            responseType: 'json',
            timeout: 5000,
          }
        )
        .then(result => {
          dispatch(updateToken(result.data.access_token));
          dispatch(updateStatus('done'));
          resetStore().then(result => {
            console.log(result);
            history.push('/');
          });
        })
        .catch(error => {
          if (error.response) {
            // Request made and server responded
            setErrorMessage(error.response.data.message);
          } else if (error.request) {
            // The request was made but no response was received
            console.log(error.request);
          } else {
            // Something happened in setting up the request that triggered an Error
            setErrorMessage(error.message);
            console.log('Error', error.message);
          }
        });
    },
    [providers]
  );

  return (
    <Container fluid={'sm'}>
      <Row className={'justify-content-center'}>
        <Col sm={4}>
          <Typography variant={'h3'} className={'mt-4 mb-4'}>
            Sign in
          </Typography>
          {providers
            .filter(x => x.config.__typename !== 'SimpleAuthProviderConfig')
            .map((provider, index) => {
              return (
                <Button
                  key={index}
                  variant="primary"
                  small
                  block
                  onClick={() => authenticate().then(() => history.push('/'))}
                >
                  {provider.label}
                </Button>
              );
            })}
          <div className={'mt-4'}>
            <div className={'col-xs-12'}>
              <div
                style={{
                  borderTop: '1px solid',
                  borderColor: '#d9dadc',
                  display: 'block',
                  lineHeight: '1px',
                  margin: '15px 0',
                  position: 'relative',
                  textAlign: 'center',
                }}
              >
                <strong
                  style={{
                    background: '#fff',
                    fontSize: '12px',
                    letterSpacing: '1px',
                    padding: '0 20px',
                    textTransform: 'uppercase',
                  }}
                >
                  OR
                </strong>
              </div>
            </div>
          </div>
          {errorMessage && (
            <Alert variant={'danger'} onClose={() => setErrorMessage(undefined)} dismissible>
              {errorMessage}
            </Alert>
          )}
          <Formik
            validationSchema={validationSchema}
            initialValues={initialValues}
            onSubmit={(values, { setSubmitting }) => {
              dispatch(updateStatus('authenticating'));
              localStorage.setItem(AUTH_USER_KEY, values.username);
              localStorage.setItem(AUTH_PROVIDER_KEY, PROVIDER_SIMPLE);
              login(values.username, values.password).finally(() => setSubmitting(false));
            }}
          >
            {({ values, handleSubmit, isSubmitting }) => {
              return (
                <Form onSubmit={handleSubmit}>
                  <Form.Row>
                    <InputField
                      name={'username'}
                      title={'Email'}
                      disabled={isSubmitting}
                      value={values.username}
                      autoComplete={'username'}
                    />
                  </Form.Row>
                  <Form.Row>
                    <InputField
                      name={'password'}
                      title={'Password'}
                      disabled={isSubmitting}
                      value={values.password}
                      type={'password'}
                      autoComplete={'password'}
                    />
                  </Form.Row>
                  <div className={'d-flex mt-4'}>
                    <div className={'flex-grow-1'} />
                    <Button variant="primary" type={'submit'} className={'ml-3'} disabled={isSubmitting} small>
                      Sign in
                    </Button>
                  </div>
                </Form>
              );
            }}
          </Formik>
          <div className={'mt-4'}>
            <div className={'col-xs-12'}>
              <div
                style={{
                  borderTop: '1px solid',
                  borderColor: '#d9dadc',
                  display: 'block',
                  lineHeight: '1px',
                  margin: '15px 0',
                  position: 'relative',
                  textAlign: 'center',
                }}
              ></div>
            </div>
            {/* Hide register button until functionality is implemented */}
            {/* <Typography variant={'h5'}>Don't have an account?</Typography>
            <Button variant="primary" type={'submit'} small block onClick={() => history.push('/register')}>
              Sign up
            </Button> */}
          </div>
        </Col>
      </Row>
    </Container>
  );
};
export default LoginPage;
