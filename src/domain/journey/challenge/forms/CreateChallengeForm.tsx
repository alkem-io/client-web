import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Form, Formik } from 'formik';
import { MessageWithPayload } from '../../../shared/i18n/ValidationMessageTranslation';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { SMALL_TEXT_LENGTH, MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import Gutters from '../../../../core/ui/grid/Gutters';
import { TagsetField } from '../../../platform/admin/components/Common/TagsetSegment';
import FormikEffectFactory from '../../../../core/ui/forms/FormikEffect';
import { JourneyCreationForm } from '../../../shared/components/JorneyCreationDialog/JourneyCreationForm';
import MarkdownValidator from '../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import useDefaultInnovationFlowTemplate from '../../../collaboration/InnovationFlow/DefaultInnovationFlow/useDefaultInnovationFlowTemplate';
import { FormikSwitch } from '../../../../core/ui/forms/FormikSwitch';

const FormikEffect = FormikEffectFactory<FormValues>();

interface FormValues {
  displayName: string;
  tagline: string;
  background: string;
  vision: string;
  tags: string[];
  addDefaultCallouts: boolean;
  innovationFlowTemplateId: string;
}

interface CreateChallengeFormProps extends JourneyCreationForm {}

export const CreateChallengeForm: FC<CreateChallengeFormProps> = ({ isSubmitting, onValidChanged, onChanged }) => {
  const { t } = useTranslation();
  const { defaultInnovationFlowTemplateId } = useDefaultInnovationFlowTemplate();

  const validationRequiredString = t('forms.validations.required');
  const validationRequiredInnovationFlowString = t('components.innovationFlowTemplateSelect.required');

  const handleChanged = (value: FormValues) =>
    onChanged({
      displayName: value.displayName,
      tagline: value.tagline,
      background: value.background,
      vision: value.vision,
      tags: value.tags,
      addDefaultCallouts: value.addDefaultCallouts,
      innovationFlowTemplateId: value.innovationFlowTemplateId,
    });

  const initialValues: FormValues = {
    displayName: '',
    tagline: '',
    background: '',
    vision: '',
    tags: [],
    addDefaultCallouts: true,
    innovationFlowTemplateId: defaultInnovationFlowTemplateId ?? '',
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
    innovationFlowTemplateId: yup.string().required(validationRequiredInnovationFlowString),
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
              title={t('context.challenge.displayName.title')}
              helperText={t('context.challenge.displayName.description')}
              disabled={isSubmitting}
              maxLength={SMALL_TEXT_LENGTH}
            />
            <FormikInputField
              name="tagline"
              title={t('context.challenge.tagline.title')}
              helperText={t('context.challenge.tagline.description')}
              disabled={isSubmitting}
              maxLength={SMALL_TEXT_LENGTH}
            />
            <FormikMarkdownField
              name="background"
              title={t('context.challenge.background.title')}
              rows={5}
              helperText={t('context.challenge.background.description')}
              disabled={isSubmitting}
              maxLength={MARKDOWN_TEXT_LENGTH}
            />
            <FormikMarkdownField
              name="vision"
              title={t('context.challenge.vision.title')}
              rows={5}
              helperText={t('context.challenge.vision.description')}
              disabled={isSubmitting}
              maxLength={MARKDOWN_TEXT_LENGTH}
            />
            <TagsetField
              name="tags"
              disabled={isSubmitting}
              title={t('context.challenge.tags.title')}
              helperText={t('context.challenge.tags.description')}
            />
            <FormikSwitch name="addDefaultCallouts" title={t('context.challenge.addDefaultCallouts.title')} />
          </Gutters>
        </Form>
      )}
    </Formik>
  );
};
