import axios from 'axios';
import { Formik } from 'formik';
import React, { FC } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import { useDispatch } from 'react-redux';
import { useHistory } from 'react-router-dom';
import * as yup from 'yup';
import { updateStatus, updateToken } from '../reducers/auth/actions';
import InputField from './Admin/Common/InputField';
import Button from './core/Button';
import Typography from './core/Typography';

interface RegisterPageProps {}

const validationSchema = yup.object().shape({
  email: yup.string().required('Please enter your email address.'),
  password: yup.string().required('Please enter your password.'),
});

const initialValues = {
  email: '',
  password: '',
};
const loginQuery = async (username: string, password: string) => {
  return await axios
    .post(
      '/auth/login',
      {
        username,
        password,
      },
      {
        responseType: 'json',
      }
    )
    .then(result => result);
};

export const LoginPage: FC<RegisterPageProps> = () => {
  const history = useHistory();
  const dispatch = useDispatch();

  return (
    <Container fluid={'sm'}>
      <Row className={'justify-content-center'}>
        <Col sm={3}>
          <Typography variant={'h3'} className={'mt-4 mb-4'}>
            Sign in
          </Typography>
          <Formik
            validationSchema={validationSchema}
            initialValues={initialValues}
            onSubmit={(values, { setSubmitting }) => {
              loginQuery(values.email, values.password)
                .then(result => {
                  console.log(result);
                  dispatch(updateToken(result.data.access_token));
                  dispatch(updateStatus('done'));
                  history.push('/');
                })
                .finally(() => setSubmitting(false));
            }}
          >
            {({ values, handleSubmit, isSubmitting }) => {
              return (
                <Form onSubmit={handleSubmit}>
                  <Form.Row>
                    <InputField name={'email'} title={'Email'} disabled={isSubmitting} value={values.email} />
                  </Form.Row>
                  <Form.Row>
                    <InputField
                      name={'password'}
                      title={'Password'}
                      disabled={isSubmitting}
                      value={values.password}
                      type={'password'}
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
