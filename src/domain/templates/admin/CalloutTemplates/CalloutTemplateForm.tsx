import React, { ReactNode, useMemo } from 'react';
import { FormikProps } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import {
  CalloutType,
  CreateCalloutInput,
  CreateProfileInput,
  CreateReferenceInput,
  CreateWhiteboardInput,
  Visual,
} from '../../../../core/apollo/generated/graphql-schema';
import { displayNameValidator } from '../../../../core/ui/forms/validator/displayNameValidator';
import calloutIcons from '../../../collaboration/callout/utils/calloutIcons';
import { RadioButtonOption } from '../../../../core/ui/forms/radioButtons/RadioButtonsGroup';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import TemplateFormBase from '../../_new/components/Forms/TemplateFormBase';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import { gutters } from '../../../../core/ui/grid/utils';
import { TagsetField } from '../../../platform/admin/components/Common/TagsetSegment';
import FormikRadioButtonsGroup from '../../../../core/ui/forms/radioButtons/FormikRadioButtonsGroup';
import FormikWhiteboardPreview from '../WhiteboardTemplates/FormikWhiteboardPreview';

export interface CalloutTemplateFormValues {
  displayName: string;
  description: string;
  tags: string[];
  framing: {
    profile: {
      displayName: string;
      description: string;
      referencesData?: CreateReferenceInput[];
    };
    tags: string[];
    whiteboard?: CreateWhiteboardInput;
  };
  contributionDefaults: {
    postDescription?: string;
    whiteboardContent?: string;
  };
  type: CalloutType;
}

export interface CalloutTemplateFormSubmittedValues {
  visualUri?: string;
  profile: CreateProfileInput;
  tags?: string[];
  callout: CreateCalloutInput /* { //!!
    framing: {
      profile: {
        displayName: string;
        description: string;
        referencesData?: CreateReferenceInput[];
      };
      tags: string[];
      whiteboard?: CreateWhiteboardInput;
    };
    contributionDefaults: {
      postDescription?: string;
      whiteboardContent?: string;
    };
    type: CalloutType;
  }*/;
}

interface CalloutTemplateFormProps {
  initialValues: Partial<CalloutTemplateFormValues>;
  visual?: Visual;
  onSubmit: (values: CalloutTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<CalloutTemplateFormValues>) => ReactNode);
  loading?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const validator: yup.ObjectSchemaDefinition<Partial<any>> = {
  framing: yup
    .object()
    .shape({
      profile: yup.object().shape({
        displayName: displayNameValidator,
      }),
    })
    .default(undefined),
};

const CalloutTemplateForm = ({ initialValues, visual, onSubmit, actions }: CalloutTemplateFormProps) => {
  const { t } = useTranslation();

  const calloutTypeOptions = useMemo<RadioButtonOption<CalloutType>[]>(() => {
    return [
      CalloutType.Post,
      CalloutType.Whiteboard,
      CalloutType.LinkCollection,
      CalloutType.PostCollection,
      CalloutType.WhiteboardCollection,
    ].map(type => ({
      value: type,
      icon: calloutIcons[type],
      label: t(`components.calloutTypeSelect.label.${type}` as const),
    }));
  }, [t]);

  return (
    <TemplateFormBase
      initialValues={initialValues}
      visual={visual}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
      entityTypeName={t('common.callout')}
    >
      {({ values }) => (
        <>
          <FormikInputField name="framing.profile.displayName" title={t('common.title')} />
          <Box marginBottom={gutters(-1)}>
            <FormikMarkdownField
              name="framing.profile.description"
              title={t('common.description')}
              maxLength={MARKDOWN_TEXT_LENGTH}
            />
          </Box>
          <TagsetField name="framing.tags" title={t('common.tags')} />
          <FormikRadioButtonsGroup name="type" options={calloutTypeOptions} />
          {values.type === CalloutType.Whiteboard && (
            <FormikWhiteboardPreview name="framing.whiteboard.content" canEdit />
          )}
          {values.type === CalloutType.WhiteboardCollection && (
            <FormikWhiteboardPreview name="contributionDefaults.whiteboardContent" canEdit />
          )}
          {values.type === CalloutType.PostCollection && (
            <Box marginBottom={gutters(-1)}>
              <FormikMarkdownField
                name="contributionDefaults.postDescription"
                title={t('common.description')}
                maxLength={MARKDOWN_TEXT_LENGTH}
              />
            </Box>
          )}
        </>
      )}
    </TemplateFormBase>
  );
};

export default CalloutTemplateForm;
