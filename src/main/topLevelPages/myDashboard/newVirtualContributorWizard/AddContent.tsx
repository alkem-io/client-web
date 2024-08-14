import React, { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as yup from 'yup';
import { pullAt } from 'lodash';
import { LoadingButton } from '@mui/lab';
import { Box, Button, DialogContent, IconButton, Theme, Tooltip, useMediaQuery } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Caption } from '../../../../core/ui/typography';
import Gutters from '../../../../core/ui/grid/Gutters';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { Actions } from '../../../../core/ui/actions/Actions';
import {
  LONG_MARKDOWN_TEXT_LENGTH,
  MID_TEXT_LENGTH,
  SMALL_TEXT_LENGTH,
} from '../../../../core/ui/forms/field-length.constants';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import { gutters } from '../../../../core/ui/grid/utils';
import { MessageWithPayload } from '../../../../domain/shared/i18n/ValidationMessageTranslation';
import CancelDialog from './CancelDialog';

type AddContentProps = {
  onClose: () => void;
  onCreateVC: (values: ContentFormValues) => Promise<void>;
};

export interface PostValues {
  title: string;
  description: string;
}

export interface DocumentValues {
  name: string;
  url: string;
}

export interface ContentFormValues {
  posts: PostValues[];
  documents: DocumentValues[];
}

const MAX__POSTS = 25;
const MIN__POSTS = 1;

const AddContent = ({ onClose, onCreateVC }: AddContentProps) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);
  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down('sm'));

  const validationSchema = yup.object().shape({
    posts: yup.array().of(
      yup.object().shape({
        title: yup
          .string()
          .min(3, MessageWithPayload('forms.validations.minLength'))
          .max(SMALL_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength'))
          .required(MessageWithPayload('forms.validations.requiredField')),
        description: MarkdownValidator(LONG_MARKDOWN_TEXT_LENGTH),
      })
    ),
    documents: yup
      .array()
      .of(
        yup.object().shape({
          name: yup
            .string()
            .min(3, MessageWithPayload('forms.validations.minLength'))
            .max(SMALL_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength'))
            .when('url', {
              is: (url: string) => url.length > 0,
              then: yup.string().required(),
              otherwise: yup.string().notRequired(),
            }),
          url: yup.string().max(MID_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength')),
        })
      )
      .min(MIN__POSTS, MessageWithPayload('forms.validations.minLength')),
  });

  const initialValues: ContentFormValues = {
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

  const newPost = () => ({
    title: '',
    description: '',
  });

  const onCancel = () => {
    setDialogOpen(true);
  };

  const newDocument = () => ({
    name: '',
    url: '',
  });

  return (
    <>
      <DialogHeader onClose={onCancel}>{t('createVirtualContributorWizard.addContent.title')}</DialogHeader>
      <DialogContent sx={{ paddingTop: 0 }}>
        <Gutters disablePadding paddingBottom={gutters(2)}>
          <span>
            <Caption>{t('createVirtualContributorWizard.addContent.description')}</Caption>
            <Caption fontWeight="bold">{t('createVirtualContributorWizard.addContent.descriptionBold')}</Caption>
          </span>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onCreateVC}>
            {({ values, isValid, setFieldValue }) => {
              const handleAdd = () => {
                const newArray = [...values.posts, newPost()];
                setFieldValue('posts', newArray);
              };
              const handleDelete = (index: number) => {
                const nextPosts = [...values.posts];
                pullAt(nextPosts, index);
                setFieldValue('posts', nextPosts);
              };
              const handleAddDocument = () => {
                const newArrayDocuments = [...values.documents, newDocument()];
                setFieldValue('documents', newArrayDocuments);
              };
              const handleDeleteDocument = (index: number) => {
                const nextDocuments = [...values.documents];
                pullAt(nextDocuments, index);
                setFieldValue('documents', nextDocuments);
              };
              return (
                <>
                  {values.posts?.map((post, index) => (
                    <Gutters disablePadding key={index}>
                      <FormikInputField
                        name={`posts[${index}].title`}
                        title={t('createVirtualContributorWizard.addContent.post.title')}
                        required
                        value={post.title}
                      />
                      <Box display="flex" flexDirection="column">
                        <FormikMarkdownField
                          name={`posts[${index}].description`}
                          title={t('common.post')}
                          rows={7}
                          maxLength={LONG_MARKDOWN_TEXT_LENGTH}
                          hideImageOptions
                          value={post.description}
                        />
                        {values.posts.length > MIN__POSTS && (
                          <Tooltip
                            title={t('createVirtualContributorWizard.addContent.post.delete')}
                            placement={'bottom'}
                          >
                            <IconButton
                              onClick={() => handleDelete(index)}
                              size="large"
                              aria-label={t('createVirtualContributorWizard.addContent.post.delete')}
                              sx={{ marginTop: gutters(-1), alignSelf: 'flex-end' }}
                            >
                              <DeleteOutlineIcon color="primary" />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </Gutters>
                  ))}

                  <Tooltip
                    title={
                      values.posts.length >= MAX__POSTS
                        ? t('createVirtualContributorWizard.addContent.post.tooltip')
                        : t('createVirtualContributorWizard.addContent.post.addAnotherPost')
                    }
                    placement={'bottom-start'}
                  >
                    <Box>
                      <Button
                        color="primary"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        disabled={values.posts.length >= MAX__POSTS}
                        onClick={handleAdd}
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
                  {values.documents?.map((document, index) => (
                    <Gutters key={index} data-reference={index} row={!isMobile} disablePadding>
                      <FormikInputField
                        name={`documents[${index}].name`}
                        title={t('createVirtualContributorWizard.addContent.documents.referenceTitle')}
                        fullWidth={isMobile}
                        value={document.name}
                      />
                      <Box flexGrow={1} width={isMobile ? '100%' : undefined}>
                        <Box display="flex">
                          <FormikInputField
                            name={`documents[${index}].url`}
                            title={t('createVirtualContributorWizard.addContent.documents.referenceUrl')}
                            fullWidth
                            value={document.url}
                          />
                          <Box>
                            <Tooltip
                              title={t('createVirtualContributorWizard.addContent.documents.remove')}
                              id={'remove-link'}
                              placement={'bottom'}
                            >
                              <IconButton
                                aria-label={t('buttons.delete')}
                                onClick={() => handleDeleteDocument(index)}
                                size="large"
                                color="primary"
                              >
                                <DeleteOutlineIcon />
                              </IconButton>
                            </Tooltip>
                          </Box>
                        </Box>
                      </Box>
                    </Gutters>
                  ))}
                  <Tooltip
                    title={t('createVirtualContributorWizard.addContent.documents.addAnother')}
                    placement={'bottom'}
                  >
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
                          values.posts.length < MIN__POSTS
                            ? t('createVirtualContributorWizard.addContent.submitDisabled')
                            : undefined
                        }
                        placement={'bottom-start'}
                      >
                        <span>
                          <LoadingButton variant="contained" disabled={!isValid} onClick={() => onCreateVC(values)}>
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
        </Gutters>
      </DialogContent>
      <CancelDialog open={dialogOpen} onClose={() => setDialogOpen(false)} onConfirm={onClose} />
    </>
  );
};

export default AddContent;
