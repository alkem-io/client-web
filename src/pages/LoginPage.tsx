import { Formik } from 'formik';
import React, { FC, useCallback, useMemo, useState } from 'react';
import { Alert, Col, Container, Form, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import { AuthenticationProviderConfig } from '../generated/graphql';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useSimpleAuth } from '../hooks/useSimpleAuth';
import InputField from '../components/Admin/Common/InputField';
import Button from '../components/core/Button';
import Typography from '../components/core/Typography';
import { useUpdateNavigation } from '../hooks/useNavigation';

interface LoginPageProps {
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

export const LoginPage: FC<LoginPageProps> = ({ providers }) => {
  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });
  const history = useHistory();
  const dispatch = useDispatch();
  const { authenticate } = useAuthenticate();
  const { login } = useSimpleAuth();
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleLogin = useCallback(
    async (username: string, password: string) => {
      return login(username, password)
        .then(() => {
          history.push('/');
        })
        .catch((error: Error) => {
          setErrorMessage(error.message);
        });
    },
    [login, dispatch]
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
              handleLogin(values.username, values.password).finally(() => setSubmitting(false));
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
            <Typography variant={'h5'}>Don't have an account?</Typography>
            <Button variant="primary" type={'submit'} small block onClick={() => history.push('/register')}>
              Sign up
            </Button>
          </div>
        </Col>
      </Row>
    </Container>
  );
};
export default LoginPage;
