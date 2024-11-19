import { useMemo } from 'react';
import { Form, Formik } from 'formik';
import { Grid } from '@mui/material';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { ForumDiscussionCategory } from '@/core/apollo/generated/graphql-schema';
import { SMALL_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import DiscussionIcon from '../views/DiscussionIcon';
import { Discussion } from '../models/Discussion';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import FormikSelect from '@/core/ui/forms/FormikSelect';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { LoadingButton } from '@mui/lab';

export interface DiscussionFormValues {
  title: string;
  category: ForumDiscussionCategory | null;
  description: string;
}

export interface DiscussionFormProps {
  onSubmit: (values: DiscussionFormValues) => Promise<void>;
  discussion?: Discussion;
  categories: ForumDiscussionCategory[];
  editMode?: boolean;
}

const DiscussionForm = ({ onSubmit, discussion, categories, editMode }: DiscussionFormProps) => {
  const { t } = useTranslation();

  const initialValues: DiscussionFormValues = {
    title: discussion?.title ?? '',
    category: discussion?.category ?? null,
    description: discussion?.description ?? '',
  };

  const validationSchema = yup.object().shape({
    title: yup.string().trim().max(SMALL_TEXT_LENGTH).required(t('forms.validations.required')),
    category: yup.string().nullable().required(t('forms.validations.required')),
    description: MarkdownValidator(MARKDOWN_TEXT_LENGTH).trim().required(t('forms.validations.required')),
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

  return (
    <Formik initialValues={initialValues} validationSchema={validationSchema} enableReinitialize onSubmit={onSubmit}>
      {({ isValid, dirty, isSubmitting }) => (
        <Form noValidate>
          <Grid container spacing={2}>
            <Grid item xs={12} md={9}>
              <FormikInputField
                name="title"
                title={t('components.discussionForm.title.title')}
                placeholder={t('components.discussionForm.title.placeholder')}
                disabled={isSubmitting}
                maxLength={SMALL_TEXT_LENGTH}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormikSelect
                disabled={editMode}
                title={t('components.discussionForm.category.title')}
                name="category"
                values={discussionCategories}
                value={discussion ? discussion.category : null}
              />
            </Grid>
            <Grid item xs={12}>
              <FormikMarkdownField
                name="description"
                title={t('components.discussionForm.description.title')}
                placeholder={t('components.discussionForm.description.placeholder')}
                rows={10}
                multiline
                disabled={isSubmitting}
                maxLength={MARKDOWN_TEXT_LENGTH}
              />
            </Grid>
            <Grid item>
              <LoadingButton type="submit" variant="contained" loading={isSubmitting} disabled={!isValid || !dirty}>
                {isSubmitting
                  ? t('buttons.processing')
                  : editMode
                  ? t('components.updateDiscussion.buttons.post')
                  : t('components.newDiscussion.buttons.post')}
              </LoadingButton>
            </Grid>
          </Grid>
        </Form>
      )}
    </Formik>
  );
};

export default DiscussionForm;
