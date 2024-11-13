import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Form, Formik } from 'formik';
import { MessageWithPayload } from '../../../shared/i18n/ValidationMessageTranslation';
import FormikInputField from '@core/ui/forms/FormikInputField/FormikInputField';
import { SMALL_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '@core/ui/forms/field-length.constants';
import FormikMarkdownField from '@core/ui/forms/MarkdownInput/FormikMarkdownField';
import Gutters from '@core/ui/grid/Gutters';
import { TagsetField } from '../../../platform/admin/components/Common/TagsetSegment';
import FormikEffectFactory from '@core/ui/forms/FormikEffect';
import { JourneyCreationForm } from '../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import MarkdownValidator from '@core/ui/forms/MarkdownInput/MarkdownValidator';
import { FormikSwitch } from '@core/ui/forms/FormikSwitch';

const FormikEffect = FormikEffectFactory<FormValues>();

interface FormValues {
  displayName: string;
  tagline: string;
  background: string;
  vision: string;
  tags: string[];
  addTutorialCallouts: boolean;
  addCallouts: boolean;
}

interface CreateSubspaceFormProps extends JourneyCreationForm {}

export const CreateSubspaceForm: FC<CreateSubspaceFormProps> = ({ isSubmitting, onValidChanged, onChanged }) => {
  const { t } = useTranslation();

  const validationRequiredString = t('forms.validations.required');

  const handleChanged = (value: FormValues) =>
    onChanged({
      displayName: value.displayName,
      tagline: value.tagline,
      background: value.background,
      vision: value.vision,
      tags: value.tags,
      addTutorialCallouts: value.addTutorialCallouts,
      addCallouts: value.addCallouts,
    });

  const initialValues: FormValues = {
    displayName: '',
    tagline: '',
    background: '',
    vision: '',
    tags: [],
    addTutorialCallouts: false,
    addCallouts: true,
  };

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

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={validationSchema}
      enableReinitialize
      validateOnMount
      onSubmit={() => {}}
    >
      {() => (
        <Form noValidate>
          <Gutters disablePadding>
            <FormikEffect onChange={handleChanged} onStatusChange={onValidChanged} />
            <FormikInputField
              name="displayName"
              title={t('context.subspace.displayName.title')}
              helperText={t('context.subspace.displayName.description')}
              disabled={isSubmitting}
              maxLength={SMALL_TEXT_LENGTH}
            />
            <FormikInputField
              name="tagline"
              title={t('context.subspace.tagline.title')}
              helperText={t('context.subspace.tagline.description')}
              disabled={isSubmitting}
              maxLength={SMALL_TEXT_LENGTH}
            />
            <FormikMarkdownField
              name="background"
              title={t('context.subspace.background.title')}
              rows={5}
              helperText={t('context.subspace.background.description')}
              disabled={isSubmitting}
              maxLength={MARKDOWN_TEXT_LENGTH}
              temporaryLocation
            />
            <FormikMarkdownField
              name="vision"
              title={t('context.subspace.vision.title')}
              rows={5}
              helperText={t('context.subspace.vision.description')}
              disabled={isSubmitting}
              maxLength={MARKDOWN_TEXT_LENGTH}
              temporaryLocation
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
