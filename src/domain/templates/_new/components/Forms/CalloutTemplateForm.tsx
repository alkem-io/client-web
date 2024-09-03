import React, { ReactNode, useMemo } from 'react';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { FormikProps } from 'formik';
import TemplateFormBase, { TemplateFormProfileSubmittedValues } from './TemplateFormBase';
import MarkdownValidator from '../../../../../core/ui/forms/MarkdownInput/MarkdownValidator';
import { MARKDOWN_TEXT_LENGTH } from '../../../../../core/ui/forms/field-length.constants';
import { CalloutType, TemplateType } from '../../../../../core/apollo/generated/graphql-schema';
import FormikMarkdownField from '../../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { CalloutTemplate } from '../../models/CalloutTemplate';
import { displayNameValidator } from '../../../../../core/ui/forms/validator';
import calloutIcons from '../../../../collaboration/callout/utils/calloutIcons';
import { RadioButtonOption } from '../../../../../core/ui/forms/radioButtons/RadioButtonsGroup';
import FormikInputField from '../../../../../core/ui/forms/FormikInputField/FormikInputField';
import { Box } from '@mui/material';
import { gutters } from '../../../../../core/ui/grid/utils';
import { TagsetField } from '../../../../platform/admin/components/Common/TagsetSegment';
import FormikRadioButtonsGroup from '../../../../../core/ui/forms/radioButtons/FormikRadioButtonsGroup';
import FormikWhiteboardPreview from '../../../admin/WhiteboardTemplates/FormikWhiteboardPreview';
import EmptyWhiteboard from '../../../../common/whiteboard/EmptyWhiteboard';

export interface CalloutTemplateFormSubmittedValues extends TemplateFormProfileSubmittedValues {
  callout?: {
    framing: {
      profile: {
        displayName: string;
        description: string;
        references?: {
          ID: string;
          name: string;
          description?: string;
          uri?: string;
        }[];
        tagsets: {
          ID: string;
          tags: string[];
        }[];
      };
      whiteboard?: {
        nameID?: string;
        profileData: {
          displayName: string;
          description?: string;
        }
        content: string;
      };
    };
    contributionDefaults: {
      postDescription?: string;
      whiteboardContent?: string;
    };
    type: CalloutType;
  }
}

interface CalloutTemplateFormProps {
  template?: CalloutTemplate;
  onSubmit: (values: CalloutTemplateFormSubmittedValues) => void;
  actions: ReactNode | ((formState: FormikProps<CalloutTemplateFormSubmittedValues>) => ReactNode);
}

const validator = {
  callout: yup.object().shape({
    framing: yup.object().shape({
      profile: yup.object().shape({
        displayName: displayNameValidator,
        description: MarkdownValidator(MARKDOWN_TEXT_LENGTH).required(),
        references: yup.array().of(
          yup.object().shape({
            name: yup.string().required(),
            description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
            uri: yup.string().url(),
          }),
        ),
        tagsets: yup.array().of(yup.object().shape({
          tags: yup.array().of(yup.string().required()).required()
        })),
      }),
      whiteboard: yup.object().shape({
        nameID: yup.string(),
        profileData: yup.object().shape({
          displayName: yup.string(),
          description: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
        }),
        content: yup.string(),
      }),
    }),
    contributionDefaults: yup.object().shape({
      postDescription: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
      whiteboardContent: MarkdownValidator(MARKDOWN_TEXT_LENGTH),
    }),
    type: yup.mixed<CalloutType>().oneOf(Object.values(CalloutType).filter(value => typeof value === 'string')).required(),
  }).required(),
};


const CalloutTemplateForm = ({ template, onSubmit, actions }: CalloutTemplateFormProps) => {
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

  const initialValues: CalloutTemplateFormSubmittedValues = {
    profile: {
      displayName: template?.profile.displayName ?? '',
      description: template?.profile.description ?? '',
      tagsets: template?.profile.tagset ? [template?.profile.tagset] : [],
    },
    callout: {
      framing: {
        profile: {
          displayName: template?.callout?.framing.profile?.displayName ?? '',
          description: template?.callout?.framing.profile?.description ?? '',
          references: template?.callout?.framing.profile?.references?.map(ref => (
            { ID: ref.id, name: ref.name, description: ref.description, uri: ref.uri }
          )) ?? [],
          tagsets: template?.callout?.framing.profile?.tagsets ?? [],
        },
        whiteboard: {
          profileData: {
            displayName: template?.callout?.framing.whiteboard?.profileData.displayName ?? '',
            description: template?.callout?.framing.whiteboard?.profileData.description ?? '',
          },
          content: template?.callout?.framing.whiteboard?.content ?? JSON.stringify(EmptyWhiteboard),
        },
      },
      contributionDefaults: {
        postDescription: template?.callout?.contributionDefaults?.postDescription ?? '',
        whiteboardContent: template?.callout?.contributionDefaults?.whiteboardContent ?? '',
      },
      type: template?.callout?.type ?? CalloutType.Post,
    }
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
      {({ values, errors }) => {
        console.log('CalloutTemplatesForm validation errors', errors); //!!

        return (
          <>
            <FormikInputField name="callout.framing.profile.displayName" title={t('common.title')} />
            <Box marginBottom={gutters(-1)}>
              <FormikMarkdownField
                name="callout.framing.profile.description"
                title={t('common.description')}
                maxLength={MARKDOWN_TEXT_LENGTH}
              />
            </Box>
            <TagsetField name="callout.framing.profile.tagsets[0].tags" title={t('common.tags')} />
            <FormikRadioButtonsGroup name="callout.type" options={calloutTypeOptions} />
            {values.callout?.type === CalloutType.Whiteboard && (
              <FormikWhiteboardPreview name="callout.framing.whiteboard.content" canEdit />
            )}
            {values.callout?.type === CalloutType.WhiteboardCollection && (
              <FormikWhiteboardPreview name="callout.contributionDefaults.whiteboardContent" canEdit />
            )}
            {values.callout?.type === CalloutType.PostCollection && (
              <Box marginBottom={gutters(-1)}>
                <FormikMarkdownField
                  name="callout.contributionDefaults.postDescription"
                  title={t('common.description')}
                  maxLength={MARKDOWN_TEXT_LENGTH}
                />
              </Box>
            )}
          </>
        );
      }}
    </TemplateFormBase>
  );
};

export default CalloutTemplateForm;


