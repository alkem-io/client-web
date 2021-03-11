import { Formik } from 'formik';
import React, { FC } from 'react';
import { Col, Container, Form, Row } from 'react-bootstrap';
import * as yup from 'yup';
import InputField from './Admin/Common/InputField';
import Button from './core/Button';
import Typography from './core/Typography';

interface RegisterPageProps {}

const validationSchema = yup.object().shape({
  // userName: yup.string().required('This is the required field'),
  firstName: yup.string().required('This is the required field'),
  lastName: yup.string().required('This is the required field'),
  email: yup.string().email('Email is not valid').required('This is the required field'),
  password: yup.string().required('Password can not be empty').min(8, 'Password should be at least 8 symbols long'),
  passwordConfirmation: yup.string().oneOf([yup.ref('password'), undefined], 'Passwords must match'),
});

const initialValues = {
  userName: '',
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  passwordConfirmation: '',
};

export const RegisterPage: FC<RegisterPageProps> = () => {
  return (
    <Container>
      <Row className={'justify-content-center'}>
        <Col sm={4}>
          <Typography variant={'h3'} className={'mt-4 mb-4'}>
            Register User
          </Typography>
          <Formik
            validationSchema={validationSchema}
            initialValues={initialValues}
            onSubmit={(values, { setSubmitting }) => {
              console.log(values);
              setSubmitting(false);
            }}
          >
            {({ values, handleSubmit, isSubmitting }) => {
              return (
                <Form onSubmit={handleSubmit}>
                  {/* <Form.Row>
                <InputField name={'userName'} title={'Username'} value={values.userName} />
              </Form.Row> */}
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
