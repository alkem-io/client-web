import * as yup from 'yup';
import { Form, Formik } from 'formik';
import { useTranslation } from 'react-i18next';

import Gutters from '../../../../core/ui/grid/Gutters';
import { FormikSwitch } from '../../../../core/ui/forms/FormikSwitch';
import FormikEffectFactory from '../../../../core/ui/forms/FormikEffect';
import { TagsetField } from '../../../platform/admin/components/Common/TagsetSegment';
import { MessageWithPayload } from '../../../shared/i18n/ValidationMessageTranslation';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';

import { SMALL_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import { type JourneyCreationForm } from '../../../shared/components/JorneyCreationDialog/JourneyCreationForm';

const FormikEffect = FormikEffectFactory<FormValues>();

export const CreateSubspaceForm = ({ isSubmitting, onValidChanged, onChanged }: CreateSubspaceFormProps) => {
  const { t } = useTranslation();

  const handleChanged = (value: FormValues) =>
    onChanged({
      tags: value.tags,
      tagline: value.tagline,
      vision: value.vision,
      background: value.background,
      addCallouts: value.addCallouts,
      displayName: value.displayName,
      addTutorialCallouts: value.addTutorialCallouts,
    });

  const validationRequiredString = t('forms.validations.required');

  const validationSchema = yup.object().shape({
    displayName: yup
      .string()
      .trim()
      .min(3, MessageWithPayload('forms.validations.minLength'))
      .max(SMALL_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength'))
      .required(validationRequiredString),
    tagline: yup
      .string()
      .trim()
      .min(3, MessageWithPayload('forms.validations.minLength'))
      .max(SMALL_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength'))
      .required(validationRequiredString),
    background: MarkdownValidator(MARKDOWN_TEXT_LENGTH).trim().required(validationRequiredString),
    vision: MarkdownValidator(MARKDOWN_TEXT_LENGTH).trim().required(validationRequiredString),
    tags: yup.array().of(yup.string().min(2)).notRequired(),
  });

  const initialValues: FormValues = {
    tags: [],
    vision: '',
    tagline: '',
    background: '',
    displayName: '',
    addCallouts: true,
    addTutorialCallouts: false,
  };

  return (
    <Formik
      validateOnMount
      enableReinitialize
      initialValues={initialValues}
      validationSchema={validationSchema}
      onSubmit={() => {}}
    >
      {() => (
        <Form noValidate>
          <Gutters disablePadding>
            <FormikEffect onChange={handleChanged} onStatusChange={onValidChanged} />

            <FormikInputField
              name="displayName"
              disabled={isSubmitting}
              maxLength={SMALL_TEXT_LENGTH}
              title={t('context.subspace.displayName.title')}
              helperText={t('context.subspace.displayName.description')}
            />

            <FormikInputField
              name="tagline"
              disabled={isSubmitting}
              maxLength={SMALL_TEXT_LENGTH}
              title={t('context.subspace.tagline.title')}
              helperText={t('context.subspace.tagline.description')}
            />

            <FormikMarkdownField
              rows={5}
              name="background"
              temporaryLocation
              disabled={isSubmitting}
              maxLength={MARKDOWN_TEXT_LENGTH}
              title={t('context.subspace.background.title')}
              helperText={t('context.subspace.background.description')}
            />

            <FormikMarkdownField
              rows={5}
              name="vision"
              temporaryLocation
              disabled={isSubmitting}
              maxLength={MARKDOWN_TEXT_LENGTH}
              title={t('context.subspace.vision.title')}
              helperText={t('context.subspace.vision.description')}
            />

            <TagsetField
              name="tags"
              disabled={isSubmitting}
              title={t('context.subspace.tags.title')}
              helperText={t('context.subspace.tags.description')}
            />

            <FormikSwitch name="addCallouts" title={t('context.subspace.addCallouts.title')} />

            <FormikSwitch name="addTutorialCallouts" title={t('context.subspace.addTutorialCallouts.title')} />
          </Gutters>
        </Form>
      )}
    </Formik>
  );
};

type FormValues = {
  tags: string[];
  vision: string;
  tagline: string;
  background: string;
  displayName: string;
  addCallouts: boolean;
  addTutorialCallouts: boolean;
};

type CreateSubspaceFormProps = JourneyCreationForm;
