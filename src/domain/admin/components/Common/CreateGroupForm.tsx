import { Grid } from '@mui/material';
import { Form, Formik } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import Button from '../../../../common/components/core/Button';
import WrapperTypography from '../../../../common/components/core/WrapperTypography';

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
    <Grid container spacing={2} direction={'column'}>
      <Grid item>
        <WrapperTypography variant="h3">Create group</WrapperTypography>
      </Grid>
      <Grid item>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={(values, { setSubmitting }) => handleSubmit(values.name, setSubmitting)}
        >
          {({ values, handleSubmit, isSubmitting }) => {
            return (
              <Form noValidate onSubmit={handleSubmit}>
                <Grid container item spacing={2}>
                  <Grid item xs={12}>
                    <FormikInputField
                      name={'name'}
                      title={'Name'}
                      value={values.name}
                      required={true}
                      placeholder={'Enter a name'}
                    />
                  </Grid>

                  <Grid container item justifyContent={'flex-end'}>
                    <Button type={'submit'} color={'primary'} disabled={isSubmitting}>
                      {t('buttons.create')}
                    </Button>
                  </Grid>
                </Grid>
              </Form>
            );
          }}
        </Formik>
      </Grid>
    </Grid>
  );
};
export default CreateGroupForm;
