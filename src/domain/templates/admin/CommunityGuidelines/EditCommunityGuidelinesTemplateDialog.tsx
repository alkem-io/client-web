import {
  CommunityGuidelinesTemplateFragment,
  TemplateType,
  UpdateTemplateMutationVariables,
} from '../../../../core/apollo/generated/graphql-schema';
import { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import CommunityGuidelinesTemplateForm, {
  CommunityGuidelinesTemplateFormSubmittedValues,
  CommunityGuidelinesTemplateFormValues,
} from './CommunityGuidelinesTemplateForm';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';
import TemplateDialogBase from '../../_new/components/Dialogs/TemplateDialogBase';

interface EditCommunityGuidelinesTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: UpdateTemplateMutationVariables) => void;
  onDelete: () => void;
  template: CommunityGuidelinesTemplateFragment | undefined;
}

const EditCommunityGuidelinesTemplateDialog = ({
  template,
  open,
  onClose,
  onSubmit,
  onDelete,
}: EditCommunityGuidelinesTemplateDialogProps) => {

  if (!template) {
    return null;
  }

  const initialValues: Partial<CommunityGuidelinesTemplateFormValues> = {
    guidelines: {
      profile: {
        displayName: template.communityGuidelines?.profile.displayName,
        description: template.communityGuidelines?.profile.description ?? '',
        references: template.communityGuidelines?.profile.references ?? [],
      },
    },
    profile: {
      displayName: template.profile.displayName,
      description: template.profile.description ?? '',
      tags: template.profile.tagset?.tags ?? [],
    }
  };

  const handleSubmit = (values: CommunityGuidelinesTemplateFormSubmittedValues) => {
    const variables: UpdateTemplateMutationVariables = {
      templateId: template.id,
      profile: {
        displayName: values.profile?.displayName,
        description: values.profile?.description,
        tagsets: [
          {
            ID: template.profile.tagset?.id!,
            tags: values.tags || [],
          },
        ],
      },
      communityGuidelines: {
        profile: {
          displayName: values.guidelines?.profile?.displayName,
          description: values.guidelines?.profile?.description,
          references: values.guidelines?.profile?.references?.map(reference => ({
            ID: reference.id,
            name: reference.name,
            uri: reference.uri,
          })),
        },
      },
    };
    return onSubmit(variables);
  };

  return (
    <TemplateDialogBase
      open={open}
      onClose={onClose}
      templateType={TemplateType.CommunityGuidelines}
      onDelete={onDelete}
      editMode
    >
      {({ actions }) => (
        <StorageConfigContextProvider locationType="template" templateId={template?.id}>
          <CommunityGuidelinesTemplateForm
            initialValues={initialValues}
            visual={template.profile.visual}
            onSubmit={handleSubmit}
            actions={actions}
            profileId={template.communityGuidelines?.profile.id}
          />
        </StorageConfigContextProvider>
      )}
    </TemplateDialogBase>
  );
};

export default EditCommunityGuidelinesTemplateDialog;
