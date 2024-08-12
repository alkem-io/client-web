import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Formik } from 'formik';
import * as yup from 'yup';
import { LoadingButton } from '@mui/lab';
import { Box, Button, DialogContent, IconButton, Tooltip } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import { Caption } from '../../../../core/ui/typography';
import Gutters from '../../../../core/ui/grid/Gutters';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { Actions } from '../../../../core/ui/actions/Actions';
import { LONG_MARKDOWN_TEXT_LENGTH, SMALL_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import CancelDialog from './CancelDialog';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import { pullAt } from 'lodash';
import DeleteIcon from '../../../../domain/journey/space/pages/SpaceSettings/icon/DeleteIcon';
import { gutters } from '../../../../core/ui/grid/utils';
import { MessageWithPayload } from '../../../../domain/shared/i18n/ValidationMessageTranslation';

type AddContentProps = {
  onClose: () => void;
  onCreateVC: (posts: PostsFormValues) => Promise<void>;
};

export interface PostValues {
  title: string;
  description: string;
}

export interface PostsFormValues {
  posts: PostValues[];
}

const AddContent = ({ onClose, onCreateVC }: AddContentProps) => {
  const { t } = useTranslation();
  const [dialogOpen, setDialogOpen] = useState(false);

  const validationSchema = yup.object().shape({
    posts: yup.array().of(
      yup.object().shape({
        title: yup
          .string()
          .min(3, MessageWithPayload('forms.validations.minLength'))
          .max(SMALL_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength'))
          .required(t('createVirtualContributorWizard.addContent.post.titleError')),
        description: MarkdownValidator(LONG_MARKDOWN_TEXT_LENGTH),
      })
    ),
  });

  const initialValues: PostsFormValues = {
    posts: [
      {
        title: t('createVirtualContributorWizard.addContent.post.exampleTitle'),
        description: t('createVirtualContributorWizard.addContent.post.exampleDescription'),
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

  return (
    <>
      <DialogHeader onClose={onCancel}>{t('createVirtualContributorWizard.addContent.title')}</DialogHeader>
      <DialogContent>
        <Gutters disablePadding disableGap paddingBottom={gutters(2)}>
          <Caption>{t('createVirtualContributorWizard.addContent.description')}</Caption>
          <Caption fontWeight="bold">{t('createVirtualContributorWizard.addContent.descriptionBold')}</Caption>
          <Formik initialValues={initialValues} validationSchema={validationSchema} onSubmit={onCreateVC}>
            {({ values: { posts }, isValid, setFieldValue }) => {
              const handleAdd = () => {
                const newArray = [...posts, newPost()];
                setFieldValue('posts', newArray);
              };
              const handleDelete = (index: number) => {
                const nextPosts = [...posts];
                pullAt(nextPosts, index);
                setFieldValue('posts', nextPosts);
              };
              return (
                <>
                  {posts.map((post, index) => (
                    <Gutters paddingX={0} key={index}>
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
                            <DeleteIcon />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </Gutters>
                  ))}

                  <Tooltip
                    title={t('createVirtualContributorWizard.addContent.post.addAnotherPost')}
                    placement={'bottom'}
                  >
                    <Box>
                      <Button
                        color="primary"
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => {
                          handleAdd();
                        }}
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
                      <LoadingButton variant="contained" disabled={!isValid} onClick={() => onCreateVC({ posts })}>
                        {t('buttons.continue')}
                      </LoadingButton>
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
