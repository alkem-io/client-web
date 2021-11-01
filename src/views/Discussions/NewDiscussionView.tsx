import { Grid } from '@material-ui/core';
import { Form, Formik, FormikHelpers } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import FormikInputField from '../../components/composite/forms/FormikInputField';
import FormikMarkdownField from '../../components/composite/forms/FormikMarkdownField';
import Button from '../../components/core/Button';

interface formValues {
  title: string;
  description: string;
}

export interface NewDiscussionViewProps {
  onPost?: (values: formValues) => void | Promise<void>;
}

const NewDiscussionView: FC<NewDiscussionViewProps> = ({ onPost }) => {
  const { t } = useTranslation();

  const initialValues: formValues = {
    title: '',
    description: '',
  };

  const validationSchema = yup.object().shape({
    title: yup.string().required(t('forms.validations.required')),
    description: yup.string().required(t('forms.validations.required')),
  });

  const handleSubmit = async (values: formValues, _helpers: FormikHelpers<formValues>) => {
    if (onPost) {
      await onPost(values);
    }
  };

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      onSubmit={handleSubmit}
    >
      {({ isValid, dirty }) => (
        <Form noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormikInputField name="title" title="Title" placeholder="Discussion title" />
            </Grid>
            <Grid item xs={12}>
              <FormikMarkdownField
                name="description"
                title="Further information"
                placeholder="Add further information on the discussion here."
                rows={10}
                multiline
              />
            </Grid>
            <Grid item>
              <Button variant="primary" text="Post discussion" type="submit" disabled={!isValid || !dirty} />
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};
export default NewDiscussionView;
