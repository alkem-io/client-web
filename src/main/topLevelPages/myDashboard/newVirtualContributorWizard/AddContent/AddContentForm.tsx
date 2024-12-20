import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { pullAt } from 'lodash';
import * as yup from 'yup';
import { Box, Button, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { gutters } from '@/core/ui/grid/utils';
import { LoadingButton } from '@mui/lab';
import { LONG_MARKDOWN_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { Actions } from '@/core/ui/actions/Actions';
import { MessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { PostsFormValues } from './AddContentProps';
import { PostItem } from './PostItem';

const MAX_POSTS = 25;

const newPost = () => ({
  title: '',
  description: '',
});

export const AddContentForm = ({
  onSubmit,
  onCancel,
}: {
  onCancel: () => void;
  onSubmit: (values: PostsFormValues) => void;
}) => {
  const { t } = useTranslation();

  const validationSchema = yup.object().shape({
    posts: yup
      .array()
      .of(
        yup.object().shape({
          title: yup
            .string()
            .min(3, MessageWithPayload('forms.validations.minLength'))
            .max(SMALL_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength'))
            .required(MessageWithPayload('forms.validations.requiredField')),
          description: MarkdownValidator(LONG_MARKDOWN_TEXT_LENGTH),
        })
      )
      .min(1, MessageWithPayload('forms.validations.minLength')),
  });

  const initialValues: PostsFormValues = {
    posts: [
      {
        title: t('createVirtualContributorWizard.addContent.post.exampleTitle'),
        description: t('createVirtualContributorWizard.addContent.post.exampleDescription'),
      },
    ],
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit}>
      {({ values: { posts }, isValid, setFieldValue }) => {
        const moreThanOnePost = posts.length > 1;
        const maxPostsReached = posts.length >= MAX_POSTS;

        const handleAddPost = () => {
          const newArray = [...posts, newPost()];
          setFieldValue('posts', newArray);
        };
        const handleDeletePost = (index: number) => {
          const nextPosts = [...posts];
          pullAt(nextPosts, index);
          setFieldValue('posts', nextPosts);
        };

        return (
          <>
            {posts.map((post, index) => (
              <PostItem key={index} post={post} index={index} onDelete={handleDeletePost} hasDelete={moreThanOnePost} />
            ))}

            <Tooltip
              title={
                maxPostsReached
                  ? t('createVirtualContributorWizard.addContent.post.tooltip')
                  : t('createVirtualContributorWizard.addContent.post.addAnotherPost')
              }
              placement="bottom-start"
            >
              <Box>
                <Button
                  color="primary"
                  variant="outlined"
                  startIcon={<AddIcon />}
                  disabled={maxPostsReached}
                  onClick={() => handleAddPost()}
                >
                  {t('createVirtualContributorWizard.addContent.post.addAnotherPost')}
                </Button>
              </Box>
            </Tooltip>

            <Box
              sx={{
                position: 'absolute',
                bottom: 0,
                right: 0,
                zIndex: 1400,
                width: '100%',
                padding: gutters(),
                paddingTop: gutters(0.5),
                backgroundColor: 'background.paper',
              }}
            >
              <Actions justifyContent="flex-end">
                <Button variant="text" onClick={onCancel}>
                  {t('buttons.cancel')}
                </Button>
                <Tooltip
                  title={
                    Boolean(posts.length) ? undefined : t('createVirtualContributorWizard.addContent.submitDisabled')
                  }
                  placement={'bottom-start'}
                >
                  <span>
                    <LoadingButton variant="contained" disabled={!isValid} onClick={() => onSubmit({ posts })}>
                      {t('buttons.continue')}
                    </LoadingButton>
                  </span>
                </Tooltip>
              </Actions>
            </Box>
          </>
        );
      }}
    </Formik>
  );
};
