import React, { FC } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { Form, Formik } from 'formik';
import { MessageWithPayload } from '../../../shared/i18n/ValidationMessageTranslation';
import FormikInputField from '../../../../common/components/composite/forms/FormikInputField';
import { MARKDOWN_TEXT_LENGTH, NORMAL_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import MarkdownInput from '../../../platform/admin/components/Common/MarkdownInput';
import SectionSpacer from '../../../shared/components/Section/SectionSpacer';
import { TagsetField } from '../../../platform/admin/components/Common/TagsetSegment';
import FormikEffectFactory from '../../../../common/utils/formik/formik-effect/FormikEffect';
import { JourneyCreationForm } from '../../../shared/components/JorneyCreationDialog/JourneyCreationForm';

const FormikEffect = FormikEffectFactory<FormValues>();

interface FormValues {
  displayName: string;
  tagline: string;
  vision: string;
  tags: string[];
}

interface CreateOpportunityFormProps extends JourneyCreationForm {}

export const CreateOpportunityForm: FC<CreateOpportunityFormProps> = ({ isSubmitting, onValidChanged, onChanged }) => {
  const { t } = useTranslation();

  const validationRequiredString = t('forms.validations.required');

  const handleChanged = (value: FormValues) =>
    onChanged({
      displayName: value.displayName,
      tagline: value.tagline,
      vision: value.vision,
      tags: value.tags,
    });

  const initialValues: FormValues = {
    displayName: '',
    tagline: '',
    vision: '',
    tags: [],
  };

  const validationSchema = yup.object().shape({
    displayName: yup
      .string()
      .trim()
      .min(3, MessageWithPayload('forms.validations.minLength'))
      .max(NORMAL_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength'))
      .required(validationRequiredString),
    tagline: yup
      .string()
      .trim()
      .min(3, MessageWithPayload('forms.validations.minLength'))
      .max(NORMAL_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength'))
      .required(validationRequiredString),
    vision: yup
      .string()
      .trim()
      .max(MARKDOWN_TEXT_LENGTH, MessageWithPayload('forms.validations.maxLength'))
      .required(validationRequiredString),
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
          <FormikEffect onChange={handleChanged} onStatusChange={onValidChanged} />
          <FormikInputField
            name="displayName"
            title={t('context.opportunity.displayName.title')}
            helperText={t('context.opportunity.displayName.description')}
            disabled={isSubmitting}
            withCounter
            maxLength={NORMAL_TEXT_LENGTH}
          />
          <SectionSpacer />
          <FormikInputField
            name="tagline"
            title={t('context.opportunity.tagline.title')}
            helperText={t('context.opportunity.tagline.description')}
            disabled={isSubmitting}
            withCounter
            maxLength={NORMAL_TEXT_LENGTH}
          />
          <SectionSpacer />
          <MarkdownInput
            name="vision"
            label={t('context.opportunity.vision.title')}
            rows={5}
            helperText={t('context.opportunity.vision.description')}
            disabled={isSubmitting}
            withCounter
            maxLength={MARKDOWN_TEXT_LENGTH}
          />
          <SectionSpacer double />
          <TagsetField
            name="tags"
            disabled={isSubmitting}
            title={t('context.opportunity.tags.title')}
            helperText={t('context.opportunity.tags.description')}
          />
        </Form>
      )}
    </Formik>
  );
};
