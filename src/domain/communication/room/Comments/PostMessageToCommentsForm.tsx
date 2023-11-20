import React, { FC } from 'react';
import { FetchResult } from '@apollo/client';
import { Avatar, AvatarProps, Box, styled } from '@mui/material';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useUserContext } from '../../../community/user';
import FormikCommentInputField from './FormikCommentInputField';
import { gutters } from '../../../../core/ui/grid/utils';
import useCurrentBreakpoint from '../../../../core/ui/utils/useCurrentBreakpoint';
import { COMMENTS_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';

const UserAvatar = styled(props => <Avatar {...props} />)<AvatarProps>(({ theme }) => ({
  height: theme.avatarSizeXs,
  width: theme.avatarSizeXs,
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
  maxLength = COMMENTS_TEXT_LENGTH,
  disabled,
}) => {
  const { t } = useTranslation();

  const { user } = useUserContext();

  const userAvatarUri = user?.user?.profile.avatar?.uri;

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

  const breakpoint = useCurrentBreakpoint();

  const isCompact = breakpoint === 'xs';

  return (
    <Box display="flex" alignItems="start" gap={gutters(0.5)} marginBottom={gutters(-1)}>
      <UserAvatar
        src={userAvatarUri}
        variant="rounded"
        aria-label={t('common.avatar-of', { user: user?.user?.profile.displayName })}
      />
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
                required
                sx={{
                  height: gutters(2),
                }}
                compactMode={isCompact}
              />
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default PostMessageToCommentsForm;
