import { Formik } from 'formik';
import React, { FC, useState } from 'react';
import { Alert, Col, Container, Form, Row } from 'react-bootstrap';
import { useHistory } from 'react-router';
import * as yup from 'yup';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useSimpleAuth } from '../hooks/useSimpleAuth';
import InputField from './Admin/Common/InputField';
import Button from './core/Button';
import Typography from './core/Typography';

interface RegisterPageProps {}
interface FormValues {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  passwordConfirmation: string;
}
const validationSchema = yup.object().shape({
  name: yup.string().required('This is the required field'),
  firstName: yup.string().required('This is the required field'),
  lastName: yup.string().required('This is the required field'),
  email: yup.string().email('Email is not valid').required('This is the required field'),
  password: yup.string().required('Password can not be empty').min(8, 'Password should be at least 8 symbols long'),
  passwordConfirmation: yup.string().oneOf([yup.ref('password'), undefined], 'Passwords must match'),
});

const initialValues: FormValues = {
  name: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
};

export const RegisterPage: FC<RegisterPageProps> = () => {
  const { register } = useSimpleAuth();
  const history = useHistory();
  const { resetStore } = useAuthenticate();
  const [errorMessage, setErrorMessage] = useState<string>();

  const handleErrors = error => {
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
  };

  const handleRegister = async (values: FormValues) => {
    try {
      await register(
        values.name,
        values.firstName,
        values.lastName,
        values.email,
        values.password,
        values.passwordConfirmation
      );

      try {
        resetStore().then(() => {
          history.push('/welcome');
        });
      } catch (error) {
        return handleErrors(error);
      }
    } catch (error) {
      debugger;
      return handleErrors(error);
    }
  };

  return (
    <Container>
      <Row className={'justify-content-center'}>
        <Col sm={4}>
          <Typography variant={'h3'} className={'mt-4 mb-4'}>
            Register User
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
              handleRegister(values).finally(() => setSubmitting(false));
            }}
          >
            {({ values, handleSubmit, isSubmitting }) => {
              return (
                <Form onSubmit={handleSubmit}>
                  <Form.Row>
                    <InputField name={'name'} title={'Name'} value={values.name} />
                  </Form.Row>
                  <Form.Row>
                    <InputField name={'firstName'} title={'First Name'} value={values.firstName} />
                    <InputField name={'lastName'} title={'Last Name'} value={values.lastName} />
                  </Form.Row>
                  <Form.Row>
                    <InputField
                      name={'email'}
                      title={'Email'}
                      value={values.email}
                      type={'email'}
                      autoComplete={'username'}
                    />
                  </Form.Row>
                  <Form.Row>
                    <InputField
                      name={'password'}
                      title={'Password'}
                      value={values.password}
                      type={'password'}
                      autoComplete={'new-password'}
                    />
                  </Form.Row>
                  <Form.Row>
                    <InputField
                      name={'passwordConfirmation'}
                      title={'Confirm Password'}
                      value={values.passwordConfirmation}
                      type={'password'}
                      autoComplete={'new-password'}
                    />
                  </Form.Row>
                  <div className={'d-flex mt-4'}>
                    <div className={'flex-grow-1'} />
                    <Button variant="primary" type={'submit'} className={'ml-3'} disabled={isSubmitting} small>
                      Register
                    </Button>
                  </div>
                </Form>
              );
            }}
          </Formik>
        </Col>
      </Row>
    </Container>
  );
};
export default RegisterPage;
