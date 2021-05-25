import { Formik } from 'formik';
import React, { FC, useMemo, useState } from 'react';
import { Alert, Col, Container, Form, Row } from 'react-bootstrap';
import { Trans, useTranslation } from 'react-i18next';
import { useHistory } from 'react-router';
import * as yup from 'yup';
import CheckBoxField from '../components/Admin/Common/CheckBoxField';
import InputField from '../components/Admin/Common/InputField';
import Button from '../components/core/Button';
import Typography from '../components/core/Typography';
import { useAuthenticate } from '../hooks/useAuthenticate';
import { useDemoAuth } from '../hooks/useDemoAuth';
import { useEcoverse } from '../hooks/useEcoverse';
import { useUpdateNavigation } from '../hooks/useNavigation';

interface RegisterPageProps {}
interface FormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  acceptTerms: boolean;
}

export const RegisterPage: FC<RegisterPageProps> = () => {
  const { t } = useTranslation();
  const { ecoverse } = useEcoverse();
  const currentPaths = useMemo(() => [], []);
  useUpdateNavigation({ currentPaths });

  const { register } = useDemoAuth();
  const history = useHistory();
  const { resetStore } = useAuthenticate();
  const [errorMessage, setErrorMessage] = useState<string>();

  const validationSchema = yup.object().shape({
    firstName: yup.string().required(t('forms.validations.required')),
    lastName: yup.string().required(t('forms.validations.required')),
    email: yup.string().email(t('pages.register.form.validations.email')).required(t('forms.validations.required')),
    password: yup
      .string()
      .required(t('pages.register.form.validations.password'))
      .min(8, t('pages.register.form.validations.password-strength')),
    confirmPassword: yup
      .string()
      .oneOf([yup.ref('password'), undefined], t('pages.register.form.validations.confirm-password')),
    acceptTerms: yup.boolean().oneOf([true], t('pages.register.form.validations.terms')),
  });

  const initialValues: FormValues = {
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  };

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
            <Trans
              i18nKey="pages.register.header"
              values={{ ecoverseName: ecoverse?.ecoverse.displayName }}
              components={{
                strong: <strong />,
              }}
            />
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
                    <InputField
                      name={'firstName'}
                      title={'First Name'}
                      placeholder={'Enter your first name'}
                      value={values.firstName}
                    />
                    <InputField
                      name={'lastName'}
                      title={'Last Name'}
                      placeholder={'Enter your last name'}
                      value={values.lastName}
                    />
                  </Form.Row>
                  <Form.Row>
                    <InputField
                      name={'email'}
                      title={'Email'}
                      placeholder={'Enter your email'}
                      value={values.email}
                      type={'email'}
                      autoComplete={'username'}
                    />
                  </Form.Row>
                  <Form.Row>
                    <InputField
                      name={'password'}
                      title={'Password'}
                      placeholder={'Enter a strong password'}
                      value={values.password}
                      type={'password'}
                      autoComplete={'new-password'}
                    />
                  </Form.Row>
                  <Form.Row>
                    <InputField
                      name={'confirmPassword'}
                      title={'Confirm Password'}
                      placeholder={'Confirm the password'}
                      value={values.confirmPassword}
                      type={'password'}
                      autoComplete={'new-password'}
                    />
                  </Form.Row>
                  <Form.Row>
                    <CheckBoxField name={'acceptTerms'} type={'checkbox'} required>
                      <Trans
                        i18nKey={'pages.register.terms'}
                        components={{
                          // eslint-disable-next-line jsx-a11y/anchor-has-content
                          terms: <a href={'/terms-of-use.html'} target={'_blank'} rel={'noreferrer'} />,
                          // eslint-disable-next-line jsx-a11y/anchor-has-content
                          privacy: <a href={'https://cherrytwist.org/privacy/'} target={'_blank'} rel={'noreferrer'} />,
                        }}
                      />
                    </CheckBoxField>
                  </Form.Row>
                  <div className={'d-flex mt-4'}>
                    <div className={'flex-grow-1'} />
                    <Button variant="primary" type={'submit'} className={'ml-3'} disabled={isSubmitting} small>
                      {t('pages.register.buttons.register')}
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
