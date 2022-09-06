import React, { FC } from 'react';
import { FetchResult } from '@apollo/client';
import { Avatar, AvatarProps, Box, Grid, styled, Tooltip } from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import FormikCommentInputField from '../../forms/FormikCommentInputField';
import HelpIcon from '@mui/icons-material/Help';

const AVATAR_SIZE = 7;

const UserAvatar = styled(props => <Avatar {...props} />)<AvatarProps>(({ theme }) => ({
  height: theme.spacing(AVATAR_SIZE),
  width: theme.spacing(AVATAR_SIZE),
}));
export interface PostCommentProps {
  onPostComment?: (comment: string) => Promise<FetchResult<unknown>> | void;
  title?: string;
  placeholder?: string;
  maxLength?: number;
  userAvatarUri?: string;
}
interface formValues {
  post: string;
}

const PostComment: FC<PostCommentProps> = ({ onPostComment, title, placeholder, maxLength, userAvatarUri }) => {
  const { t } = useTranslation();

  const initialValues: formValues = {
    post: '',
  };

  const validationSchema = yup.object().shape({
    post: yup.string().required(t('forms.validations.required')),
  });

  const handleSubmit = async (values: formValues, { resetForm }: FormikHelpers<formValues>) => {
    if (onPostComment) {
      const result = await onPostComment(values.post);
      if (result && !result.errors) {
        resetForm();
      }
    }
  };

  return (
    <Grid container spacing={1.5}>
      <Grid item>
        <UserAvatar src={userAvatarUri} variant="rounded" sx={{ borderRadius: 1.5 }} />
      </Grid>
      <Grid item xs>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12}>
                  <FormikCommentInputField
                    name="post"
                    title={title}
                    placeholder={placeholder}
                    disabled={isSubmitting}
                    maxLength={maxLength}
                    withCounter
                    required
                  />
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </Grid>
      <Grid item>
        <Box display={'flex'}>
          <Tooltip
            title={t('components.post-comment.tooltip.markdown-help')}
            arrow
            placement="right"
            aria-label={'tooltip-markdown'}
          >
            <HelpIcon color="primary" />
          </Tooltip>
        </Box>
      </Grid>
    </Grid>
  );
};
export default PostComment;
