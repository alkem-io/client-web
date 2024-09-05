import React from 'react';
import { useTranslation } from 'react-i18next';
import { DialogHeaderProps } from '../../../../core/ui/dialog/DialogHeader';
import CommunityGuidelinesTemplateForm, {
  CommunityGuidelinesTemplateFormSubmittedValues,
  CommunityGuidelinesTemplateFormValues,
} from '../../_new/components/Forms/CommunityGuidelinesTemplateForm';
import CreateEditTemplateDialogBase from '../../_new/components/Dialogs/CreateEditTemplateDialog/CreateEditTemplateDialogBase';

export interface CommunityGuidelinesFormValues {
  displayName: string;
  description: string | undefined;
  references: {
    id: string;
    name: string;
    description?: string;
    uri: string;
  }[];
}

interface CreateCommunityGuidelinesTemplateDialogProps {
  guidelines?: CommunityGuidelinesFormValues;
  open: boolean;
  onClose: DialogHeaderProps['onClose'];
  onSubmit: (values: CommunityGuidelinesTemplateFormSubmittedValues) => void;
}

const CreateCommunityGuidelinesTemplateDialog = ({
  guidelines,
  open,
  onClose,
  onSubmit,
}: CreateCommunityGuidelinesTemplateDialogProps) => {
  const { t } = useTranslation();

  const values: CommunityGuidelinesTemplateFormValues = {
    guidelines: {
      profile: {
        displayName: guidelines?.displayName || '',
        description: guidelines?.description || '',
        referencesData: guidelines?.references.map(reference => ({
          name: reference.name,
          description: reference.description,
          uri: reference.uri,
        })),
      },
    },
    displayName: '',
    description: '',
    tags: [],
  };

  return (
    <CreateEditTemplateDialogBase
      open={open}
      onClose={onClose}
      templateTypeName={t('templateLibrary.communityGuidelinesTemplates.name')}
    >
      {({ actions }) => (
        <CommunityGuidelinesTemplateForm initialValues={values} onSubmit={onSubmit} actions={actions} />
      )}
    </CreateEditTemplateDialogBase>
  );
};

export default CreateCommunityGuidelinesTemplateDialog;
