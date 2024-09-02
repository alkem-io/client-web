import React, { ReactNode, useMemo } from 'react';
import { FormikProps } from 'formik';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import TemplateFormBase, { TemplateProfileValues } from '../../_new/components/Forms/TemplateFormBase';
import { Reference, Tagset } from '../../../common/profile/Profile';
import { CalloutType, UpdateTemplateInput, Visual } from '../../../../core/apollo/generated/graphql-schema';
import { Identifiable } from '../../../../core/utils/Identifiable';
import { displayNameValidator } from '../../../../core/ui/forms/validator/displayNameValidator';
import calloutIcons from '../../../collaboration/callout/utils/calloutIcons';
import { RadioButtonOption } from '../../../../core/ui/forms/radioButtons/RadioButtonsGroup';
import { Caption } from '../../../../core/ui/typography/components';
import FormikInputField from '../../../../core/ui/forms/FormikInputField/FormikInputField';
import { gutters } from '../../../../core/ui/grid/utils';
import FormikMarkdownField from '../../../../core/ui/forms/MarkdownInput/FormikMarkdownField';
import { MARKDOWN_TEXT_LENGTH } from '../../../../core/ui/forms/field-length.constants';
import { TagsetField } from '../../../platform/admin/components/Common/TagsetSegment';
import FormikWhiteboardPreview from '../WhiteboardTemplates/FormikWhiteboardPreview';
import FormikRadioButtonsGroup from '../../../../core/ui/forms/radioButtons/FormikRadioButtonsGroup';

export interface CalloutTemplateFormValues extends TemplateProfileValues {
  framing: {
    profile: {
      displayName: string;
      description: string;
      references: Reference[];
      tags?: string[];
    };
    whiteboard?: {
      content: string;
    };
  };
  contributionDefaults: {
    postDescription?: string;
    whiteboardContent?: string;
  };
  type: CalloutType;
}

interface CalloutTemplateFormProps {
  template?: Identifiable & {
    profile: {
      displayName: string;
      description?: string;
      tagset?: Tagset;
    };
    callout?: {
      framing: {
        profile: {
          displayName: string;
          description?: string;
          tagset?: Tagset;
        };
        whiteboard?: Identifiable & {
          content: string;
        };
      };
      contributionDefaults: {
        postDescription?: string;
        whiteboardContent?: string;
      };
      type: CalloutType;
    };
  };
  // initialValues: Partial<CalloutTemplateFormValues>;
  visual?: Visual;
  onSubmit: (values: UpdateTemplateInput) => void;
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

const EditCalloutTemplateForm = ({ template, visual, onSubmit, actions }: CalloutTemplateFormProps) => {
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
      tooltip: <Caption>{t('components.calloutTemplateDialog.typeReadonly')}</Caption>,
    }));
  }, [t]);

  const initialValues = useMemo<CalloutTemplateFormValues>(() => {
    const { callout, profile, ...rest } = template ?? {};
    const { framing, contributionDefaults } = callout ?? {};

    const { profile: framingProfile, ...framingRest } = framing ?? {};

    return {
      displayName: profile?.displayName ?? '',
      description: profile?.description ?? '',
      tags: profile?.tagset?.tags ?? [],
      framing: {
        profile: {
          displayName: '',
          references: [],
          tags: framingProfile?.tagset?.tags ?? [],
          ...framingProfile,
          description: framingProfile?.description ?? '',
        },
        whiteboard: {
          content: '',
          profile: {
            displayName: '',
            description: '',
          },
        },
        ...framingRest,
      },
      contributionDefaults: {
        postDescription: '',
        whiteboardContent: '',
        ...contributionDefaults,
      },
      type: CalloutType.Post,
      ...rest,
    };
  }, [template?.id]);

  const handleSubmit = (values: Partial<CalloutTemplateFormValues>) => {
    const { framing, profile, tags, contributionDefaults } = values as CalloutTemplateFormValues & {
      profile: { displayName: string; description: string };
    };

    if (!template) {
      throw new Error('Template is not loaded');
    }

    const submittedValues: UpdateTemplateInput = {
      ID: template.id!,
      profile: {
        ...profile,
        tagsets: template.profile.tagset && [
          {
            ID: template.profile.tagset.id!,
            tags,
          },
        ],
      },
      callout: {
        framing: {
          profile: {
            displayName: framing.profile.displayName,
            description: framing.profile.description,
            references: framing.profile.references.map(reference => ({ ID: reference.id, ...reference })),
            tagsets: template.callout?.framing.profile.tagset &&
              framing.profile.tags && [
                {
                  ID: template.callout.framing.profile.tagset.id!,
                  tags: framing.profile.tags,
                },
              ],
          },
          whiteboard: template.callout?.framing.whiteboard &&
            framing.whiteboard && {
              content: framing.whiteboard.content,
            },
        },
        contributionDefaults: {
          postDescription: contributionDefaults.postDescription,
          whiteboardContent: contributionDefaults.whiteboardContent,
        },
      },
    };

    return onSubmit(submittedValues);
  };

  return (
    <TemplateFormBase
      initialValues={initialValues}
      visual={visual}
      onSubmit={handleSubmit}
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
          <TagsetField name="framing.profile.tags" title={t('common.tags')} />
          <FormikRadioButtonsGroup
            name="type"
            options={calloutTypeOptions}
            readOnly
            tooltipProps={{ PopperProps: { sx: { pointerEvents: 'none' } } }}
          />
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

export default EditCalloutTemplateForm;
