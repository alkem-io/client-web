import { Formik } from 'formik';
import React, { FC, useState } from 'react';
import { Alert, Col, Container, Form, Row } from 'react-bootstrap';
import { useHistory } from 'react-router';
import * as yup from 'yup';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useSimpleAuth } from '../hooks/useSimpleAuth';
import CheckBoxField from './Admin/Common/CheckBoxField';
import InputField from './Admin/Common/InputField';
import Button from './core/Button';
import Typography from './core/Typography';

interface RegisterPageProps {}
interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}
const validationSchema = yup.object().shape({
  firstName: yup.string().required('This is required field.'),
  lastName: yup.string().required('This is required field.'),
  email: yup.string().email('Email is not valid').required('This is required field.'),
  password: yup.string().required('Password can not be empty').min(8, 'Password should be at least 8 symbols long'),
  confirmPassword: yup.string().oneOf([yup.ref('password'), undefined], 'Passwords must match'),
  acceptTerms: yup.boolean().oneOf([true], 'The terms of use and privacy policy must be accepted.'),
});

const initialValues: FormValues = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  confirmPassword: '',
  acceptTerms: false,
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
    debugger;
    try {
      await register(
        values.firstName,
        values.lastName,
        values.email,
        values.password,
        values.confirmPassword,
        values.acceptTerms
      );

      try {
        resetStore().then(() => {
          history.push('/welcome');
        });
      } catch (error) {
        return handleErrors(error);
      }
    } catch (error) {
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
                      name={'confirmPassword'}
                      title={'Confirm Password'}
                      value={values.confirmPassword}
                      type={'password'}
                      autoComplete={'new-password'}
                    />
                  </Form.Row>
                  <Form.Row>
                    <CheckBoxField name={'acceptTerms'} type={'checkbox'} required>
                      {'I accept the '}
                      <a href={'https://cherrytwist.org/privacy/'} target={'_blank'} rel={'noreferrer'}>
                        Terms of Use
                      </a>
                      {' and '}
                      <a href={'https://cherrytwist.org/privacy/'} target={'_blank'} rel={'noreferrer'}>
                        Privacy Policy
                      </a>
                      .
                    </CheckBoxField>
                  </Form.Row>
                  <div className={'d-flex mt-4'}>
                    <div className={'flex-grow-1'} />
                    <Button variant="primary" type={'submit'} className={'ml-3'} disabled={isSubmitting} small>
                      Register Now
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
