import { Grid } from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import Button from '../../../core/Button';
import FormikMarkdownField from '../../forms/FormikMarkdownField';

export interface PostCommentProps {
  onPostComment?: (comment: string) => Promise<void> | void;
  title?: string;
  placeholder?: string;
}
interface formValues {
  post: string;
}

const PostComment: FC<PostCommentProps> = ({ onPostComment, title, placeholder }) => {
  const { t } = useTranslation();

  const initialValues: formValues = {
    post: '',
  };

  const validationSchema = yup.object().shape({
    post: yup.string().required(t('forms.validations.required')),
  });

  const handleSubmit = async (values: formValues, _helpers: FormikHelpers<formValues>) => {
    if (onPostComment) {
      await onPostComment(values.post);
      _helpers.resetForm();
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
              <FormikMarkdownField name="post" title={title} placeholder={placeholder} disabled={isSubmitting} />
            </Grid>
            <Grid item>
              <Button
                aria-label="post comment"
                variant="primary"
                text={isSubmitting ? t('buttons.processing') : t('components.post-comment.buttons.post')}
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
export default PostComment;
