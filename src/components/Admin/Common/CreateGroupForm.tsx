import { Formik } from 'formik';
import React, { FC } from 'react';
import { Container, Form } from 'react-bootstrap';
import Typography from '../../core/Typography';
import FormikInputField from './FormikInputField';
import * as yup from 'yup';
import Button from '../../core/Button';
import { useTranslation } from 'react-i18next';

interface CreateGroupFormProps {
  onCreate: (name: string) => Promise<void>;
}

export const CreateGroupForm: FC<CreateGroupFormProps> = ({ onCreate }) => {
  const { t } = useTranslation();
  const initialValues = {
    name: '',
  };
  const validationSchema = yup.object().shape({
    name: yup.string().required(t('forms.validations.required')),
  });

  const handleSubmit = (name: string, setSubmitting: (isSubmitting: boolean) => void) => {
    if (onCreate) {
      onCreate(name).finally(() => setSubmitting(false));
    }
  };

  return (
    <Container>
      <Typography variant={'h3'} className={'mb-4'}>
        Create group
      </Typography>
      <Formik
        initialValues={initialValues}
        validationSchema={validationSchema}
        enableReinitialize
        onSubmit={(values, { setSubmitting }) => handleSubmit(values.name, setSubmitting)}
      >
        {({ values, handleSubmit, isSubmitting }) => {
          return (
            <Form noValidate onSubmit={handleSubmit}>
              <Form.Row>
                <FormikInputField
                  name={'name'}
                  title={'Name'}
                  value={values.name}
                  required={true}
                  placeholder={'Enter a name'}
                />
              </Form.Row>
              <div className={'d-flex mt-2'}>
                <Button type={'submit'} variant={'primary'} className={'ml-auto'} disabled={isSubmitting}>
                  {t('buttons.create')}
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </Container>
  );
};
export default CreateGroupForm;
