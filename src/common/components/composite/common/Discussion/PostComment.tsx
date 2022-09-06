import React, { FC } from 'react';
import { FetchResult } from '@apollo/client';
import { Avatar, AvatarProps, Box, Grid, Popper, styled, Tooltip } from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import FormikCommentInputField from '../../forms/FormikCommentInputField';
import HelpIcon from '@mui/icons-material/Help';
import { useUserContext } from '../../../../../hooks';

const UserAvatar = styled(props => <Avatar {...props} />)<AvatarProps>(({ theme }) => ({
  height: theme.spacing(theme.comments.avatarSize),
  width: theme.spacing(theme.comments.avatarSize),
}));

const PreFormatedPopper = styled(Popper)(() => ({
  whiteSpace: 'pre-wrap',
}));

export interface PostCommentProps {
  onPostComment?: (comment: string) => Promise<FetchResult<unknown>> | void;
  title?: string;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}
interface formValues {
  post: string;
}

const PostComment: FC<PostCommentProps> = ({ onPostComment, title, placeholder, maxLength, disabled }) => {
  const { t } = useTranslation();

  const { user } = useUserContext();
  const userAvatarUri = user?.user?.profile?.avatar?.uri;

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
                    disabled={disabled || isSubmitting}
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
        <Box display={'flex'} alignItems={'center'} height="100%">
          <Tooltip
            title={t('components.post-comment.tooltip.markdown-help')}
            arrow
            placement="right"
            PopperComponent={PreFormatedPopper}
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
