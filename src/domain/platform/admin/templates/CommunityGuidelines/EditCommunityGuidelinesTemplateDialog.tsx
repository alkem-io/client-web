import { useTranslation } from 'react-i18next';
import { AdminCommunityGuidelinesTemplateFragment } from '../../../../../core/apollo/generated/graphql-schema';
import { DialogHeaderProps } from '../../../../../core/ui/dialog/DialogHeader';
import TemplateDialogBase from '../../../../collaboration/templates/templateDialog/TemplateDialogBase';
import CommunityGuidelinesTemplateForm, {
  CommunityGuidelinesTemplateFormSubmittedValues,
  CommunityGuidelinesTemplateFormValues,
} from './CommunityGuidelinesTemplateForm';

interface EditCommunityGuidelinesTemplateDialogProps {
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (
    values: CommunityGuidelinesTemplateFormSubmittedValues & { tagsetId: string | undefined; tags?: string[] }
  ) => void;
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

  console.log(template);

  const values: Partial<CommunityGuidelinesTemplateFormValues> = {
    guidelines: {
      profile: {
        displayName: template.guidelines.profile.displayName,
        description: template.guidelines.profile.description || '',
        referencesData: template.guidelines.profile.references,
      },
    },
    displayName: template.profile.displayName,
    description: template.profile.description,
    tags: template.profile.tagset?.tags,
  };

  const handleSubmit = (values: CommunityGuidelinesTemplateFormSubmittedValues) => {
    return onSubmit({
      ...values,
      tagsetId: template.profile.tagset?.id,
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
          initialValues={values}
          visual={template.profile.visual}
          onSubmit={handleSubmit}
          actions={actions}
        />
      )}
    </TemplateDialogBase>
  );
};

export default EditCommunityGuidelinesTemplateDialog;
