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
      {({ isValid, dirty, isSubmitting }) => (
        <Form noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <FormikInputField
                name="title"
                title={t('components.new-discussion.title.title')}
                placeholder={t('components.new-discussion.title.placeholder')}
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item xs={12}>
              <FormikMarkdownField
                name="description"
                title={t('components.new-discussion.description.title')}
                placeholder={t('components.new-discussion.description.placeholder')}
                rows={10}
                multiline
                disabled={isSubmitting}
              />
            </Grid>
            <Grid item>
              <Button
                variant="primary"
                text={isSubmitting ? t('buttons.processing') : t('components.new-discussion.buttons.post')}
                type="submit"
                disabled={!isValid || !dirty || isSubmitting}
              />
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};
export default NewDiscussionView;
