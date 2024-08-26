import { useTranslation } from 'react-i18next';
import {
  CommunityGuidelinesTemplateFragment,
  UpdateCommunityGuidelinesTemplateMutationVariables,
} from '../../../../core/apollo/generated/graphql-schema';
import { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import CommunityGuidelinesTemplateForm, {
  CommunityGuidelinesTemplateFormSubmittedValues,
  CommunityGuidelinesTemplateFormValues,
} from './CommunityGuidelinesTemplateForm';
import { StorageConfigContextProvider } from '../../../storage/StorageBucket/StorageConfigContext';
import TemplateDialogBase from '../../Dialogs/templateDialog/TemplateDialogBase';

interface EditCommunityGuidelinesTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: UpdateCommunityGuidelinesTemplateMutationVariables) => void;
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
  const { t } = useTranslation();

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
    displayName: template.profile.displayName,
    description: template.profile.description,
    tags: template.profile.tagset?.tags,
  };

  const handleSubmit = (values: CommunityGuidelinesTemplateFormSubmittedValues) => {
    const variables: UpdateCommunityGuidelinesTemplateMutationVariables = {
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
      templateTypeName={t('templateLibrary.communityGuidelinesTemplates.name')}
      onDelete={onDelete}
      editMode
    >
      {({ actions }) => (
        <StorageConfigContextProvider locationType="guidelinesTemplate" guidelinesTemplateId={template?.id}>
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
