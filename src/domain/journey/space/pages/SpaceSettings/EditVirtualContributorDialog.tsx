import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import VirtualContributorForm from '@/domain/community/virtualContributorAdmin/vcSettingsPage/VirtualContributorForm';
import { UpdateVirtualContributorInput, Visual } from '@/core/apollo/generated/graphql-schema';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';

export interface VirtualContributorUpdateFormValues {
  id: string;
  bodyOfKnowledgeID?: string;
  profile: {
    id: string;
    url: string;
    tagline: string;
    displayName: string;
    avatar?: Visual;
  };
}

interface EditVirtualContributorDialogProps {
  virtualContributor: VirtualContributorUpdateFormValues;
  bok?: {
    profile: {
      displayName: string;
      tagline: string;
      url: string;
    };
  };
  open: boolean;
  onClose: () => void;
  onSave: (virtualContributor: UpdateVirtualContributorInput) => void;
  submitting: boolean;
}

const EditVirtualContributorDialog: FC<EditVirtualContributorDialogProps> = ({
  virtualContributor,
  bok,
  open,
  onClose,
  onSave,
}) => {
  const { t } = useTranslation();

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={10}>
      <DialogHeader onClose={onClose} title={t('virtualContributorSpaceSettings.edit.title')} />
      <DialogContent>
        <VirtualContributorForm
          virtualContributor={virtualContributor}
          bokProfile={bok?.profile}
          avatar={virtualContributor.profile.avatar}
          onSave={onSave}
          hasBackNavigation={false}
        />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default EditVirtualContributorDialog;
