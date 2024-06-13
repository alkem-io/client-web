import { useTranslation } from 'react-i18next';
import { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import React from 'react';
import CalloutTemplateForm, {
  CalloutTemplateFormSubmittedValues,
  CalloutTemplateFormValues,
} from './CalloutTemplateForm';
import TemplateDialogBase from '../../../../collaboration/templates/templateDialog/TemplateDialogBase';
import { Reference, Tagset } from '../../../../common/profile/Profile';
import { WhiteboardFragmentWithCallout } from '../../../../collaboration/callout/useCallouts/useCallouts';
import { CalloutType } from '../../../../../core/apollo/generated/graphql-schema';
import { useWhiteboardWithContentQuery } from '../../../../../core/apollo/generated/apollo-hooks';

export interface CreateCalloutTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: CalloutTemplateFormSubmittedValues) => void;
  callout?: {
    id: string;
    framing: {
      profile: {
        id: string;
        displayName: string;
        description?: string;
        references?: Reference[];
        tagset?: Tagset;
      };
      whiteboard?: WhiteboardFragmentWithCallout;
    };
    type: CalloutType;
    contributionDefaults: {
      postDescription?: string;
      whiteboardContent?: string;
    };
  };
}

const CreateCalloutTemplateDialog = ({ open, onClose, onSubmit, callout }: CreateCalloutTemplateDialogProps) => {
  const { t } = useTranslation();

  const { data: whiteboardContent } = useWhiteboardWithContentQuery({
    variables: {
      whiteboardId: callout?.framing.whiteboard?.id!,
    },
    skip: !callout?.framing.whiteboard?.id,
  });

  const initialValues: Partial<CalloutTemplateFormValues> = {
    displayName: '',
    description: '',
    tags: [],
    framing: {
      profile: {
        displayName: callout?.framing.profile.displayName ?? '',
        description: callout?.framing.profile.description ?? '',
        referencesData:
          callout?.framing.profile.references?.map(reference => ({
            name: reference.name,
            description: reference.description,
            uri: reference.uri,
          })) ?? [],
      },
      tags: callout?.framing.profile.tagset?.tags ?? [],
      whiteboard: {
        content: whiteboardContent?.lookup.whiteboard?.content ?? '',
        profileData: {
          displayName: callout?.framing.whiteboard?.profile.displayName ?? '',
          description: callout?.framing.whiteboard?.profile.description ?? '',
        },
      },
    },
    contributionDefaults: {
      postDescription: callout?.contributionDefaults.postDescription ?? '',
      whiteboardContent: callout?.contributionDefaults.whiteboardContent ?? '',
    },
    type: callout?.type,
  };

  return (
    <TemplateDialogBase open={open} onClose={onClose} templateTypeName={t('templateLibrary.calloutTemplates.name')}>
      {({ actions }) => <CalloutTemplateForm initialValues={initialValues} onSubmit={onSubmit} actions={actions} />}
    </TemplateDialogBase>
  );
};

export default CreateCalloutTemplateDialog;
