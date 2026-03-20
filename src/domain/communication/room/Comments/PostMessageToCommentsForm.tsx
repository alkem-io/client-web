import { Box, type BoxProps, styled } from '@mui/material';
import { Form, Formik, type FormikHelpers } from 'formik';
import { useRef } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import Avatar, { type CustomAvatarProps } from '@/core/ui/avatar/Avatar';
import { COMMENTS_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { useScreenSize } from '@/core/ui/grid/constants';
import { gutters } from '@/core/ui/grid/utils';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import FormikCommentInputField, { type FormikCommentInputFieldProps } from './FormikCommentInputField';

const UserAvatar = styled(Avatar)<CustomAvatarProps>(({ theme }) => ({
  height: theme.avatarSizeXs,
  width: theme.avatarSizeXs,
}));

export interface PostMessageToCommentsFormProps {
  onPostComment: (comment: string, responseBoxElement: HTMLDivElement | null) => Promise<unknown> | void;
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
  const textBoxElementRef = useRef<HTMLDivElement | null>(null);

  const { userModel } = useCurrentUserContext();

  const userAvatarUri = userModel?.profile?.avatar?.uri;

  const initialValues: formValues = {
    post: '',
  };

  const validationSchema = yup.object().shape({
    post: yup.string().required(''), // prevent an error message from being displayed to the comment input
  });

  const handleSubmit = async (values: formValues, { resetForm }: FormikHelpers<formValues>) => {
    if (onPostComment) {
      const result = await onPostComment(values.post, textBoxElementRef.current);
      if (result) {
        resetForm();
      }
    }
  };

  const { isSmallScreen } = useScreenSize();

  return (
    <Box ref={textBoxElementRef} display="flex" alignItems="start" gap={gutters(0.5)} {...containerProps}>
      <UserAvatar
        src={userAvatarUri}
        variant="rounded"
        alt={t('common.avatar-of', { user: userModel?.profile?.displayName })}
      />
      <Box flexGrow={1} minWidth={0}>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize={true}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting }) => (
            <Form noValidate={true}>
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
                submitOnReturnKey={true}
                required={true}
                sx={{
                  height: gutters(2),
                }}
                compactMode={isSmallScreen}
              />
            </Form>
          )}
        </Formik>
      </Box>
    </Box>
  );
};

PostMessageToCommentsForm.displayName = 'PostMessageToCommentsForm';

export default PostMessageToCommentsForm;
