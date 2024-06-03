import React, { ReactNode, useMemo } from 'react';
import { FormikProps } from 'formik';
import { CalloutType, CreateProfileInput, Visual } from '../../../../../core/apollo/generated/graphql-schema';
import TemplateForm from '../TemplateForm';
import { useTranslation } from 'react-i18next';
import FormikRadioButtonsGroup from '../../../../../core/ui/forms/radioButtons/FormikRadioButtonsGroup';
import { RadioButtonOption } from '../../../../../core/ui/forms/radioButtons/RadioButtonsGroup';
import calloutIcons from '../../../../collaboration/callout/utils/calloutIcons';

export interface CalloutTemplateFormValues {
  displayName: string;
  description: string;
  tags: string[];
}

export interface CalloutTemplateFormSubmittedValues {
  visualUri?: string;
  profile: CreateProfileInput;
  tags?: string[];
}

interface CalloutTemplateFormProps {
  initialValues: Partial<CalloutTemplateFormValues>;
  visual?: Visual;
  onSubmit: (values: CalloutTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<CalloutTemplateFormValues>) => ReactNode);
  loading?: boolean;
}

const validator = {};

const CalloutTemplateForm = ({ initialValues, visual, onSubmit, actions }: CalloutTemplateFormProps) => {
  const { t } = useTranslation();

  const calloutTypeOptions = useMemo<RadioButtonOption<CalloutType>[]>(() => {
    return [CalloutType.Post, CalloutType.Whiteboard, CalloutType.LinkCollection, CalloutType.PostCollection, CalloutType.WhiteboardCollection].map((type) => ({
      value: type,
      icon: calloutIcons[type],
      label: t(`components.calloutTypeSelect.label.${type}` as const),
    }));
  }, [t]);

  return (
    <TemplateForm
      initialValues={initialValues}
      visual={visual}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
      entityTypeName={t('common.callout')}
    >
      <FormikRadioButtonsGroup name="calloutType" options={calloutTypeOptions} />
    </TemplateForm>
  );
};

export default CalloutTemplateForm;
