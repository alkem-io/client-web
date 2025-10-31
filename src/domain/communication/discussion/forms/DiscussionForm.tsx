import { useMemo } from 'react';
import { Form, Formik } from 'formik';
import { Button, GridLegacy } from '@mui/material';
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
import { textLengthValidator } from '@/core/ui/forms/validator/textLengthValidator';

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

  const validationSchema = useMemo(
    () =>
      yup.object().shape({
        title: textLengthValidator({ maxLength: SMALL_TEXT_LENGTH, required: true }),
        category: yup
          .mixed<ForumDiscussionCategory>()
          .oneOf(Object.values(ForumDiscussionCategory).filter(value => typeof value === 'string'))
          .required('forms.validations.required'),
        description: MarkdownValidator(MARKDOWN_TEXT_LENGTH, { required: true }).trim(),
      }),
    [categories]
  );

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
          <GridLegacy container spacing={2}>
            <GridLegacy item xs={12} md={9}>
              <FormikInputField
                name="title"
                title={t('components.discussionForm.title.title')}
                placeholder={t('components.discussionForm.title.placeholder')}
                disabled={isSubmitting}
                maxLength={SMALL_TEXT_LENGTH}
              />
            </GridLegacy>
            <GridLegacy item xs={12} md={3}>
              <FormikSelect
                required
                disabled={editMode}
                title={t('components.discussionForm.category.title')}
                name="category"
                values={discussionCategories}
                value={discussion ? discussion.category : null}
              />
            </GridLegacy>
            <GridLegacy item xs={12}>
              <FormikMarkdownField
                name="description"
                title={t('components.discussionForm.description.title')}
                placeholder={t('components.discussionForm.description.placeholder')}
                rows={10}
                multiline
                disabled={isSubmitting}
                maxLength={MARKDOWN_TEXT_LENGTH}
              />
            </GridLegacy>
            <GridLegacy item>
              <Button type="submit" variant="contained" loading={isSubmitting} disabled={!isValid || !dirty}>
                {isSubmitting
                  ? t('buttons.processing')
                  : editMode
                    ? t('components.updateDiscussion.buttons.post')
                    : t('components.newDiscussion.buttons.post')}
              </Button>
            </GridLegacy>
          </GridLegacy>
        </Form>
      )}
    </Formik>
  );
};

export default DiscussionForm;
