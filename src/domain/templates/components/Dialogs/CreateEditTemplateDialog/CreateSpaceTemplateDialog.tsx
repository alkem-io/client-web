import { useTranslation } from 'react-i18next';
import { useCreateTemplateFromSpaceMutation } from '@/core/apollo/generated/apollo-hooks';
import { TemplateType } from '@/core/apollo/generated/graphql-schema';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { toCreateTemplateFromSpaceMutationVariables } from '../../Forms/common/mappings';
import type { TemplateSpaceFormSubmittedValues } from '../../Forms/TemplateSpaceForm';
import CreateTemplateDialog from './CreateTemplateDialog';

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
    const variables = toCreateTemplateFromSpaceMutationVariables(templatesSetId, values);
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
