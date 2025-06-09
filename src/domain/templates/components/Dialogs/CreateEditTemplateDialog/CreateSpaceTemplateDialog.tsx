import { useTranslation } from 'react-i18next';
import CreateTemplateDialog from './CreateTemplateDialog';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { useCreateTemplateFromSpaceMutation } from '@/core/apollo/generated/apollo-hooks';
import { TemplateSpaceFormSubmittedValues } from '../../Forms/TemplateSpaceForm';
import { toCreateTemplateFromSpaceContentMutationVariables } from '../../Forms/common/mappings';
import { useNotification } from '@/core/ui/notifications/useNotification';

interface CreateSpaceTemplateDialogProps {
  open: boolean;
  onClose: () => void;
  spaceId: string;
  templatesSetId: string;
}

const CreateSpaceTemplateDialog = ({ open, onClose, spaceId, templatesSetId }: CreateSpaceTemplateDialogProps) => {
  const { t } = useTranslation();
  const notify = useNotification();

  // Save this space as a template
  const [createSpaceTemplate] = useCreateTemplateFromSpaceMutation();
  const handleSaveAsTemplate = async (values: TemplateSpaceFormSubmittedValues) => {
    const variables = toCreateTemplateFromSpaceContentMutationVariables(templatesSetId, values);
    await createSpaceTemplate({ variables });
    onClose();
    notify(t('pages.admin.subspace.notifications.templateSaved'), 'success');
  };

  return (
    <CreateTemplateDialog
      open={open}
      onClose={onClose}
      templateType={TemplateType.Space}
      onSubmit={handleSaveAsTemplate}
      getDefaultValues={async () => {
        return {
          type: TemplateType.Space,
          spaceId,
        };
      }}
    />
  );
};

export default CreateSpaceTemplateDialog;
