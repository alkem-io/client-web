import { AvatarProps, Box, BoxProps, styled } from '@mui/material';
import Avatar from '@/core/ui/avatar/Avatar';
import { Form, Formik, FormikHelpers } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { useCurrentUserContext } from '@/domain/community/user';
import FormikCommentInputField, { FormikCommentInputFieldProps } from './FormikCommentInputField';
import { gutters } from '@/core/ui/grid/utils';
import { COMMENTS_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { useScreenLayoutXsDetected } from '@/core/ui/grid/GridContext';

const UserAvatar = styled(props => <Avatar {...props} />)<AvatarProps>(({ theme }) => ({
  height: theme.avatarSizeXs,
  width: theme.avatarSizeXs,
}));

export interface PostMessageToCommentsFormProps {
  onPostComment?: (comment: string) => Promise<unknown> | void;
  title?: string;
  placeholder?: string;
  maxLength?: number;
  disabled?: boolean;
  vcInteractions?: FormikCommentInputFieldProps['vcInteractions'];
  vcEnabled?: boolean;
  threadId?: string;
}

type formValues = {
  post: string;
};

const PostMessageToCommentsForm = ({
  onPostComment,
  title,
  placeholder,
  maxLength = COMMENTS_TEXT_LENGTH,
  disabled,
  vcInteractions,
  vcEnabled = true,
  threadId,
  ...containerProps
}: PostMessageToCommentsFormProps & BoxProps) => {
  const { t } = useTranslation();

  const { userModel } = useCurrentUserContext();

  const userAvatarUri = userModel?.profile.avatar?.uri;

  const initialValues: formValues = {
    post: '',
  };

  const validationSchema = yup.object().shape({
    post: yup.string().required(t('forms.validations.required')),
  });

  const handleSubmit = async (values: formValues, { resetForm }: FormikHelpers<formValues>) => {
    if (onPostComment) {
      const result = await onPostComment(values.post);
      if (result) {
        resetForm();
      }
    }
  };

  const isMobile = useScreenLayoutXsDetected();

  return (
    <Box display="flex" alignItems="start" gap={gutters(0.5)} {...containerProps}>
      <UserAvatar
        src={userAvatarUri}
        variant="rounded"
        aria-label={t('common.avatar-of', { user: userModel?.profile.displayName })}
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
                vcInteractions={vcInteractions}
                vcEnabled={vcEnabled}
                threadId={threadId}
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
                compactMode={isMobile}
              />
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

export default PostMessageToCommentsForm;
