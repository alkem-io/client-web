import React, { FC } from 'react';
import { FetchResult } from '@apollo/client';
import { Avatar, AvatarProps, Box, Popper, styled, Tooltip } from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import HelpIcon from '@mui/icons-material/Help';
import { useUserContext } from '../../../community/contributor/user';
import FormikCommentInputField from './FormikCommentInputField';
import { gutters } from '../../../../core/ui/grid/utils';
import { Caption } from '../../../../core/ui/typography';

const UserAvatar = styled(props => <Avatar {...props} />)<AvatarProps>(({ theme }) => ({
  height: theme.avatarSizeXs,
  width: theme.avatarSizeXs,
}));

const PreFormatedPopper = styled(Popper)(() => ({
  whiteSpace: 'pre-wrap',
}));

export interface PostMessageToCommentsFormProps {
  onPostComment?: (comment: string) => Promise<FetchResult<unknown>> | void;
  title?: string;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
}
interface formValues {
  post: string;
}

const PostMessageToCommentsForm: FC<PostMessageToCommentsFormProps> = ({
  onPostComment,
  title,
  placeholder,
  maxLength,
  disabled,
}) => {
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
    <Box display="flex" alignItems="start" gap={gutters(0.5)} marginBottom={gutters(-1)}>
      <UserAvatar src={userAvatarUri} variant="rounded" />
      <Box flexGrow={1} minWidth={0}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form noValidate>
              <FormikCommentInputField
                name="post"
                size="small"
                title={title}
                placeholder={placeholder}
                disabled={disabled}
                submitting={isSubmitting}
                maxLength={maxLength}
                submitOnReturnKey
                withCounter
                required
                sx={{
                  height: gutters(2),
                }}
              />
            </Form>
          )}
        </Formik>
      </Box>
      <Box display="flex" alignItems="center" height={gutters(2)}>
        <Tooltip
          title={
            <Box padding={gutters(0.5)}>
              <Caption>{t('components.post-comment.tooltip.markdown-help')}</Caption>
            </Box>
          }
          arrow
          placement="right"
          PopperComponent={PreFormatedPopper}
          aria-label={'tooltip-markdown'}
        >
          <HelpIcon color="primary" />
        </Tooltip>
      </Box>
    </Box>
  );
};

export default PostMessageToCommentsForm;
