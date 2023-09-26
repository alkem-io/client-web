import React, { FC, useMemo } from 'react';
import { DialogContent, Grid } from '@mui/material';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import FormikSelect from '../../../../core/ui/forms/FormikSelect';
import { DiscussionCategory } from '../../../../core/apollo/generated/graphql-schema';
import DiscussionIcon from './DiscussionIcon';
import { SMALL_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { LoadingButton } from '@mui/lab';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import {
  refetchPlatformDiscussionsQuery,
  useCreateDiscussionMutation,
} from '../../../../core/apollo/generated/apollo-hooks';
import { buildDiscussionUrl } from '../../../../main/routing/urlBuilders';
import { useNavigate } from 'react-router-dom';

interface formValues {
  title: string;
  category: DiscussionCategory | null;
  description: string;
}

export interface NewDiscussionDialogProps {
  open: boolean;
  onClose: () => void;
  communicationId: string;
  categories: DiscussionCategory[];
}

const NewDiscussionDialog: FC<NewDiscussionDialogProps> = ({ open, onClose, communicationId, categories }) => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [createDiscussion] = useCreateDiscussionMutation({
    refetchQueries: [refetchPlatformDiscussionsQuery()],
  });

  const discussionCategories = useMemo(
    () =>
      categories.map(id => ({
        id: id,
        name: t(`common.enums.discussion-category.${id}` as const),
        icon: <DiscussionIcon category={id} />,
      })),
    [t, categories]
  );

  const initialValues: formValues = {
    title: '',
    category: null,
    description: '',
  };

  const validationSchema = yup.object().shape({
    title: yup.string().trim().max(SMALL_TEXT_LENGTH).required(t('forms.validations.required')),
    category: yup.string().nullable().required(t('forms.validations.required')),
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH).trim().required(t('forms.validations.required')),
  });

  const handleSubmit = async (values: formValues) => {
    const { data } = await createDiscussion({
      variables: {
        input: {
          communicationID: communicationId,
          profile: {
            description: values.description,
            displayName: values.title,
          },
          category: values.category!,
        },
      },
    });
    onClose();
    if (data?.createDiscussion) {
      navigate(buildDiscussionUrl('/forum', data.createDiscussion.nameID), { replace: true });
    }
  };

  return (
    <DialogWithGrid open={open} onClose={onClose} fullScreen>
      <DialogHeader onClose={onClose}>{t('pages.forum.new-title')}</DialogHeader>
      <DialogContent>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          enableReinitialize
          onSubmit={handleSubmit}
        >
          {({ isValid, dirty, isSubmitting }) => (
            <Form noValidate>
              <Grid container spacing={2}>
                <Grid item xs={12} md={9}>
                  <FormikInputField
                    name="title"
                    title={t('components.new-discussion.title.title')}
                    placeholder={t('components.new-discussion.title.placeholder')}
                    disabled={isSubmitting}
                    maxLength={SMALL_TEXT_LENGTH}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormikSelect
                    title={t('components.new-discussion.category.title')}
                    name="category"
                    values={discussionCategories}
                  />
                </Grid>
                <Grid item xs={12}>
                  <FormikMarkdownField
                    name="description"
                    title={t('components.new-discussion.description.title')}
                    placeholder={t('components.new-discussion.description.placeholder')}
                    rows={10}
                    multiline
                    disabled={isSubmitting}
                    maxLength={MARKDOWN_TEXT_LENGTH}
                  />
                </Grid>
                <Grid item>
                  <LoadingButton type="submit" variant="contained" loading={isSubmitting} disabled={!isValid || !dirty}>
                    {isSubmitting ? t('buttons.processing') : t('components.new-discussion.buttons.post')}
                  </LoadingButton>
                </Grid>
              </Grid>
            </Form>
          )}
        </Formik>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default NewDiscussionDialog;
