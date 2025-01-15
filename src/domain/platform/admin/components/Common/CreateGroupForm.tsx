import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { Button, Grid, Typography } from '@mui/material';
import { Form, Formik } from 'formik';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';

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
        <Typography variant="h3" mb={1} fontWeight="medium">
          Create group
        </Typography>
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
                      required
                      placeholder={'Enter a name'}
                    />
                  </Grid>

                  <Grid container item justifyContent={'flex-end'}>
                    <Button type="submit" variant="outlined" disabled={isSubmitting}>
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
