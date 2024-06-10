import { useTranslation } from 'react-i18next';
import {
  AdminCommunityGuidelinesTemplateFragment,
  UpdateCommunityGuidelinesTemplateMutationVariables,
} from '../../../../../core/apollo/generated/graphql-schema';
import { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import TemplateDialogBase from '../../../../collaboration/templates/templateDialog/TemplateDialogBase';
import CommunityGuidelinesTemplateForm, {
  CommunityGuidelinesTemplateFormSubmittedValues,
  CommunityGuidelinesTemplateFormValues,
} from './CommunityGuidelinesTemplateForm';

interface EditCommunityGuidelinesTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: UpdateCommunityGuidelinesTemplateMutationVariables) => void;
  onDelete: () => void;
  template: AdminCommunityGuidelinesTemplateFragment | undefined;
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
        displayName: template.guidelines.profile.displayName,
        description: template.guidelines.profile.description ?? '',
        references: template.guidelines.profile.references ?? [],
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
    return onSubmit({
      ...variables,
    });
  };

  return (
    <TemplateDialogBase
      open={open}
      onClose={onClose}
      templateTypeName={t('templateLibrary.postTemplates.name')}
      onDelete={onDelete}
      editMode
    >
      {({ actions }) => (
        <CommunityGuidelinesTemplateForm
          initialValues={initialValues}
          visual={template.profile.visual}
          onSubmit={handleSubmit}
          actions={actions}
        />
      )}
    </TemplateDialogBase>
  );
};

export default EditCommunityGuidelinesTemplateDialog;
