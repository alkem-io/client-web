import React, { ReactNode, useMemo } from 'react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';
import TemplateFormBase, { TemplateFormProfileSubmittedValues } from './TemplateFormBase';
import MarkdownValidator from '@/core/ui/forms/MarkdownInput/MarkdownValidator';
import { MARKDOWN_TEXT_LENGTH } from '@/core/ui/forms/field-length.constants';
import {
  CalloutAllowedContributors,
  CalloutFramingType,
  CalloutType,
  CalloutVisibility,
  TemplateType,
  UpdateReferenceInput,
  UpdateTagsetInput,
  VisualType,
} from '@/core/apollo/generated/graphql-schema';
import FormikMarkdownField from '@/core/ui/forms/MarkdownInput/FormikMarkdownField';
import { CalloutTemplate } from '@/domain/templates/models/CalloutTemplate';
import { displayNameValidator } from '@/core/ui/forms/validator/displayNameValidator';
import calloutIcons from '@/domain/collaboration/callout/utils/calloutIcons';
import { RadioButtonOption } from '@/core/ui/forms/radioButtons/RadioButtonsGroup';
import FormikInputField from '@/core/ui/forms/FormikInputField/FormikInputField';
import { Box } from '@mui/material';
import { gutters } from '@/core/ui/grid/utils';
import { TagsetField, tagsetsSegmentSchema } from '@/domain/platform/admin/components/Common/TagsetSegment';
import FormikRadioButtonsGroup from '@/core/ui/forms/radioButtons/FormikRadioButtonsGroup';
import FormikWhiteboardPreview from '@/domain/collaboration/whiteboard/WhiteboardPreview/FormikWhiteboardPreview';
import EmptyWhiteboard from '@/domain/common/whiteboard/EmptyWhiteboard';
import { mapTagsetsToUpdateTagsets, mapTemplateProfileToUpdateProfileInput } from './common/mappings';
import { Caption } from '@/core/ui/typography';
import { referenceSegmentSchema } from '@/domain/platform/admin/components/Common/ReferenceSegment';
import { mapReferenceModelsToUpdateReferenceInputs } from '@/domain/common/reference/ReferenceUtils';
import { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardPreviewImages/WhiteboardPreviewImages';
import { CalloutSettingsModelFull } from '@/domain/collaboration/new-callout/models/CalloutSettingsModel';

interface TemplateContentCallout {
  /**
   * @deprecated
   */
  calloutTypeDeprecated: CalloutType;
  framing: {
    profile: {
      displayName: string;
      description: string;
      references?: UpdateReferenceInput[];
      tagsets?: UpdateTagsetInput[];
    };
    type: CalloutFramingType;
    whiteboard?: {
      profile?: {
        displayName: string;
        description?: string;
        preview?: {
          name: VisualType.Banner;
          uri: string;
        };
      };
      content: string;
    };
  };
  settings: CalloutSettingsModelFull;
  contributionDefaults?: {
    postDescription?: string;
    whiteboardContent?: string;
  };
}

export interface TemplateCalloutFormSubmittedValues extends TemplateFormProfileSubmittedValues {
  callout?: TemplateContentCallout;
  // provided when a whiteboard has been updated before saving as template
  whiteboardPreviewImages?: WhiteboardPreviewImage[];
}

interface TemplateCalloutFormProps {
  template?: CalloutTemplate;
  onSubmit: (values: TemplateCalloutFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<TemplateCalloutFormSubmittedValues>) => ReactNode);
  temporaryLocation?: boolean;
}

const validator = {
  callout: yup
    .object()
    .shape({
      framing: yup.object().shape({
        profile: yup.object().shape({
          displayName: displayNameValidator.required(),
          description: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
          references: referenceSegmentSchema,
          tagsets: tagsetsSegmentSchema,
        }),
        whiteboard: yup.object().when(['type'], ([type], schema) => {
          return type === CalloutType.Whiteboard ? schema.required() : schema;
        }),
      }),
      contributionDefaults: yup.object().shape({
        postDescription: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
        whiteboardContent: yup.string(),
      }),
      type: yup
        .mixed<CalloutType>()
        .oneOf(Object.values(CalloutType).filter(value => typeof value === 'string'))
        .required(),
    })
    .required(),
};

const TemplateCalloutForm = ({ template, onSubmit, actions, temporaryLocation = false }: TemplateCalloutFormProps) => {
  const { t } = useTranslation();
  const createMode = !template?.id;

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
      tooltip: createMode ? undefined : <Caption>{t('components.calloutTemplateDialog.typeReadonly')}</Caption>,
    }));
  }, [t]);

  const initialValues: TemplateCalloutFormSubmittedValues = {
    profile: mapTemplateProfileToUpdateProfileInput(template?.profile),
    callout: {
      calloutTypeDeprecated: template?.callout?.calloutTypeDeprecated ?? CalloutType.Post,
      framing: {
        profile: {
          displayName: template?.callout?.framing?.profile?.displayName ?? '',
          description: template?.callout?.framing?.profile?.description ?? '',
          references: mapReferenceModelsToUpdateReferenceInputs(template?.callout?.framing?.profile?.references) ?? [],
          tagsets: mapTagsetsToUpdateTagsets(template?.callout?.framing?.profile) ?? [{ ID: '', tags: [] }], // ID will be ignored on create
        },
        type: template?.callout?.framing?.type ?? CalloutFramingType.None,
        whiteboard: {
          profile: {
            displayName: template?.callout?.framing?.whiteboard?.profile.displayName ?? '',
            description: template?.callout?.framing?.whiteboard?.profile.description ?? '',
            preview: template?.callout?.framing?.whiteboard?.profile.preview,
          },
          content: template?.callout?.framing?.whiteboard?.content ?? JSON.stringify(EmptyWhiteboard),
        },
      },
      contributionDefaults: {
        postDescription: template?.callout?.contributionDefaults?.postDescription ?? '',
        whiteboardContent: template?.callout?.contributionDefaults?.whiteboardContent ?? '',
      },
      settings: {
        contribution: {
          enabled: template?.callout?.settings?.contribution?.enabled ?? false,
          allowedTypes: template?.callout?.settings?.contribution?.allowedTypes ?? [],
          canAddContributions:
            template?.callout?.settings?.contribution?.canAddContributions ?? CalloutAllowedContributors.Members,
          commentsEnabled: template?.callout?.settings?.contribution?.commentsEnabled ?? true,
        },
        framing: {
          commentsEnabled: template?.callout?.settings?.framing?.commentsEnabled ?? false,
        },
        visibility: template?.callout?.settings?.visibility ?? CalloutVisibility.Published,
      },
    },
  };

  return (
    <TemplateFormBase
      templateType={TemplateType.Callout}
      template={template}
      initialValues={initialValues}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
    >
      {({ values }) => {
        return (
          <>
            <FormikInputField name="callout.framing.profile.displayName" title={t('common.title')} />
            <Box marginBottom={gutters(-1)}>
              <FormikMarkdownField
                name="callout.framing.profile.description"
                title={t('common.description')}
                maxLength={MARKDOWN_TEXT_LENGTH}
                temporaryLocation={temporaryLocation}
              />
            </Box>
            <TagsetField name="callout.framing.profile.tagsets[0].tags" title={t('common.tags')} />
            <FormikRadioButtonsGroup
              name="callout.calloutTypeDeprecated"
              options={calloutTypeOptions}
              readOnly={!createMode}
              tooltipProps={{ PopperProps: { sx: { pointerEvents: 'none' } } }}
            />
            {values.callout?.calloutTypeDeprecated === CalloutType.Whiteboard && (
              <FormikWhiteboardPreview
                name="callout.framing.whiteboard.content"
                previewImagesName="whiteboardPreviewImages"
                canEdit
              />
            )}
            {values.callout?.calloutTypeDeprecated === CalloutType.WhiteboardCollection && (
              <FormikWhiteboardPreview name="callout.contributionDefaults.whiteboardContent" canEdit />
            )}
            {values.callout?.calloutTypeDeprecated === CalloutType.PostCollection && (
              <Box marginBottom={gutters(-1)}>
                <FormikMarkdownField
                  name="callout.contributionDefaults.postDescription"
                  title={t('common.description')}
                  maxLength={MARKDOWN_TEXT_LENGTH}
                  temporaryLocation={temporaryLocation}
                />
              </Box>
            )}
          </>
        );
      }}
    </TemplateFormBase>
  );
};

export default TemplateCalloutForm;
