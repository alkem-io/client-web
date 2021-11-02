import { Grid } from '@material-ui/core';
import { Form, Formik, FormikHelpers } from 'formik';
import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import Button from '../../../core/Button';
import FormikMarkdownField from '../../forms/FormikMarkdownField';

export interface PostCommentProps {
  onPost?: (post: string) => void;
}
interface formValues {
  post: string;
}

const PostComment: FC<PostCommentProps> = ({ onPost }) => {
  const { t } = useTranslation();

  const initialValues: formValues = {
    post: '',
  };

  const validationSchema = yup.object().shape({
    post: yup.string().required(t('forms.validations.required')),
  });

  const handleSubmit = async (values: formValues, _helpers: FormikHelpers<formValues>) => {
    if (onPost) {
      await onPost(values.post);
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
              <FormikMarkdownField
                name="post"
                title={t('components.post-comment.fields.description.title')}
                placeholder={t('components.post-comment.fields.description.placeholder')}
              />
            </Grid>
            <Grid item>
              <Button
                aria-label="post comment"
                variant="primary"
                text={t('components.post-comment.buttons.post')}
                type="submit"
                disabled={!isValid || !dirty}
              />
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};
export default PostComment;
