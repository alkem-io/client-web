import { Formik } from 'formik';
import React, { FC } from 'react';
import { Form } from 'react-bootstrap';
import Typography from '../../core/Typography';
import InputField from './InputField';
import * as yup from 'yup';
import Button from '../../core/Button';

interface CreateGroupFormProps {
  onCreate: (name: string) => Promise<void>;
}

export const CreateGroupForm: FC<CreateGroupFormProps> = ({ onCreate }) => {
  const initialValues = {
    name: '',
  };
  const validationSchema = yup.object().shape({
    name: yup.string().required('This is the required field'),
  });

  const handleSubmit = (name: string, setSubmitting: (isSubmitting: boolean) => void) => {
    if (onCreate) {
      onCreate(name).finally(() => setSubmitting(false));
    }
  };

  return (
    <>
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
                <InputField
                  name={'name'}
                  title={'Name'}
                  value={values.name}
                  required={true}
                  placeholder={'Enter a name'}
                />
              </Form.Row>
              <div className={'d-flex'}>
                <Button type={'submit'} variant={'primary'} className={'ml-auto'} disabled={isSubmitting}>
                  Create
                </Button>
              </div>
            </Form>
          );
        }}
      </Formik>
    </>
  );
};
export default CreateGroupForm;
