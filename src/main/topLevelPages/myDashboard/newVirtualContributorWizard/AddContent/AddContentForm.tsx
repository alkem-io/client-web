import { Formik } from 'formik';
import { Trans, useTranslation } from 'react-i18next';
import { pullAt } from 'lodash';
import * as yup from 'yup';
import { Box, Button, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { gutters } from '@/core/ui/grid/utils';
import { LoadingButton } from '@mui/lab';
import { LONG_MARKDOWN_TEXT_LENGTH, MID_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import { Actions } from '@/core/ui/actions/Actions';
import { MessageWithPayload } from '@/domain/shared/i18n/ValidationMessageTranslation';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { BoKCalloutsFormValues } from './AddContentProps';
import { PostItem } from './PostItem';
import { Caption } from '@/core/ui/typography';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import { DocumentItem } from '@/main/topLevelPages/myDashboard/newVirtualContributorWizard/AddContent/DocumentItem';

const MAX_POSTS = 25;

const newPost = () => ({
  title: '',
  description: '',
});

const newDocument = () => ({
  name: '',
  url: '',
});

export const AddContentForm = ({
  onSubmit,
  onCancel,
}: {
  onCancel: () => void;
  onSubmit: (values: BoKCalloutsFormValues) => void;
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
    documents: yup.array().of(
      yup.object().shape({
        name: yup
          .string()
          .min(3, MessageWithPayload('forms.validations.minLength'))
          .max(SMALL_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength'))
          .required(MessageWithPayload('forms.validations.requiredField')),
        url: yup
          .string()
          .required(MessageWithPayload('forms.validations.requiredField'))
          .max(MID_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength')),
      })
    ),
  });

  const initialValues: BoKCalloutsFormValues = {
    posts: [
      {
        title: t('createVirtualContributorWizard.addContent.post.exampleTitle'),
        description: t('createVirtualContributorWizard.addContent.post.exampleDescription'),
      },
    ],
    documents: [
      {
        name: '',
        url: '',
      },
    ],
  };

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onSubmit} validateOnMount>
      {({ values: { posts, documents }, isValid, setFieldValue }) => {
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
        const handleAddDocument = () => {
          const newArrayDocuments = [...documents, newDocument()];
          setFieldValue('documents', newArrayDocuments);
        };
        const handleDeleteDocument = (index: number) => {
          const nextDocuments = [...documents];
          pullAt(nextDocuments, index);
          setFieldValue('documents', nextDocuments);
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

            <Caption>
              <Trans
                i18nKey="createVirtualContributorWizard.addContent.documents.title"
                components={{
                  icon: <InfoOutlinedIcon fontSize="small" color="primary" style={{ verticalAlign: 'bottom' }} />,
                  tooltip: (
                    <Tooltip
                      title={t('createVirtualContributorWizard.addContent.documents.tooltip')}
                      arrow
                      placement="top"
                    >
                      <></>
                    </Tooltip>
                  ),
                }}
              />
            </Caption>
            {documents?.map((document, index) => (
              <DocumentItem
                key={index}
                document={document}
                index={index}
                onDelete={handleDeleteDocument}
                onChange={fileName => setFieldValue(`documents[${index}].name`, fileName)}
              />
            ))}
            <Tooltip title={t('createVirtualContributorWizard.addContent.documents.addAnother')} placement={'bottom'}>
              <Box>
                <Button color="primary" variant="outlined" startIcon={<AddIcon />} onClick={handleAddDocument}>
                  {t('createVirtualContributorWizard.addContent.documents.addAnother')}
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
                    <LoadingButton
                      variant="contained"
                      disabled={!isValid}
                      onClick={() => onSubmit({ posts, documents })}
                    >
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
