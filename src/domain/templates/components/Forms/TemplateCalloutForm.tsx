import { CalloutFramingType, TemplateType } from '@/core/apollo/generated/graphql-schema';
import CalloutForm, { calloutValidationSchema } from '@/domain/collaboration/callout/CalloutForm/CalloutForm';
import { CalloutFormSubmittedValues } from '@/domain/collaboration/callout/CalloutForm/CalloutFormModel';
import { DefaultCalloutSettings } from '@/domain/collaboration/callout/models/CalloutSettingsModel';
import { mapCalloutSettingsModelToCalloutSettingsFormValues } from '@/domain/collaboration/callout/models/mappings';
import { WhiteboardPreviewImage } from '@/domain/collaboration/whiteboard/WhiteboardVisuals/WhiteboardPreviewImagesModels';
import { EmptyTagset } from '@/domain/common/tagset/TagsetModel';
import { EmptyWhiteboardString } from '@/domain/common/whiteboard/EmptyWhiteboard';
import { CalloutTemplate } from '@/domain/templates/models/CalloutTemplate';
import { useMemo } from 'react';
import TemplateFormBase, { TemplateFormProfileSubmittedValues } from './TemplateFormBase';
import { mapTemplateProfileToUpdateProfileInput } from './common/mappings';
import { TemplateFormProps } from './TemplateForm';
import { DefaultWhiteboardPreviewSettings } from '@/domain/collaboration/whiteboard/WhiteboardPreviewSettings/WhiteboardPreviewSettingsModel';

interface TemplateContentCallout extends CalloutFormSubmittedValues {}

export interface TemplateCalloutFormSubmittedValues extends TemplateFormProfileSubmittedValues {
  callout?: TemplateContentCallout;
  // provided when a whiteboard has been updated before saving as template
  whiteboardPreviewImages?: WhiteboardPreviewImage[];
}

interface TemplateCalloutFormProps extends TemplateFormProps<CalloutTemplate, TemplateCalloutFormSubmittedValues> {}

const validator = {
  callout: calloutValidationSchema,
};

const TemplateCalloutForm = ({ template, onSubmit, actions }: TemplateCalloutFormProps) => {
  const createMode = !template.id;

  const initialValues = useMemo<TemplateCalloutFormSubmittedValues>(
    () => ({
      profile: mapTemplateProfileToUpdateProfileInput(template.profile),
      callout: {
        framing: {
          profile: {
            id: template.callout?.framing?.profile?.id ?? '',
            displayName: template.callout?.framing?.profile?.displayName ?? '',
            description: template.callout?.framing?.profile?.description ?? '',
            references: template.callout?.framing?.profile?.references ?? [],
            tagsets: template.callout?.framing.profile.tagsets ?? [EmptyTagset],
          },
          type: template.callout?.framing?.type ?? CalloutFramingType.None,
          whiteboard: template.callout?.framing?.whiteboard
            ? {
                profile: {
                  displayName: template.callout.framing.whiteboard.profile.displayName,
                },
                previewImages: [], // This is not going to work for now :(
                content: template.callout.framing.whiteboard.content ?? EmptyWhiteboardString,
                previewSettings:
                  template.callout.framing.whiteboard.previewSettings ?? DefaultWhiteboardPreviewSettings,
              }
            : undefined,
          memo: template.callout?.framing?.memo
            ? {
                profile: {
                  displayName: template.callout.framing.memo.profile.displayName,
                },
                markdown: template.callout.framing.memo.markdown,
              }
            : undefined,
          link: template.callout?.framing?.link
            ? {
                id: template.callout.framing.link.id ?? '',
                uri: template.callout.framing.link.uri,
                profile: {
                  displayName: template.callout.framing.link.profile.displayName,
                },
              }
            : undefined,
        },
        contributionDefaults: {
          defaultDisplayName: template.callout?.contributionDefaults?.defaultDisplayName ?? '',
          postDescription: template.callout?.contributionDefaults?.postDescription ?? '',
          whiteboardContent: template.callout?.contributionDefaults?.whiteboardContent ?? '',
        },
        settings: mapCalloutSettingsModelToCalloutSettingsFormValues(
          template.callout?.settings ?? DefaultCalloutSettings
        ),
      },
    }),
    [
      template,
      mapTemplateProfileToUpdateProfileInput,
      DefaultCalloutSettings,
      mapCalloutSettingsModelToCalloutSettingsFormValues,
    ]
  );

  return (
    <TemplateFormBase
      templateType={TemplateType.Callout}
      template={template}
      initialValues={initialValues}
      onSubmit={onSubmit}
      actions={actions}
      validator={validator}
    >
      {({ values, setFieldValue }) => {
        /*
        This is a special case, <CalloutForm> has its own formik context (validation and everything),
        so we need to pass the values to our current formik context with that onChange setFieldValue.
        Other template types don't work like this.
        */
        return (
          <>
            <CalloutForm
              callout={values.callout}
              calloutRestrictions={{
                readOnlyAllowedTypes: !createMode,
                temporaryLocation: createMode,
                readOnlyContributions: true,
                disableWhiteboards: !createMode,
                disableMemos: !createMode,
                disableLinks: !createMode,
              }}
              onChange={calloutFormValues => {
                setFieldValue('callout', calloutFormValues);
              }}
              edit
              template
              containerProps={{ disablePadding: true }}
            />
          </>
        );
      }}
    </TemplateFormBase>
  );
};

export default TemplateCalloutForm;
