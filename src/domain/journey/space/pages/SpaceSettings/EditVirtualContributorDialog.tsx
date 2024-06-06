import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import { Dialog, DialogContent } from '@mui/material';
import DialogHeader from '../../../../../core/ui/dialog/DialogHeader';
import VirtualContributorForm from '../../../../community/virtualContributor/vcSettingsPage/VirtualContributorForm';
import { UpdateVirtualContributorInput, Visual } from '../../../../../core/apollo/generated/graphql-schema';

export interface VirtualContributorUpdateFormValues {
  id: string;
  bodyOfKnowledgeID?: string;
  nameID: string;
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
    <Dialog open={open} onClose={onClose} maxWidth="md">
      <DialogHeader onClose={onClose} title={t('virtualContributorSpaceSettings.titleEdit')} />
      <DialogContent>
        <VirtualContributorForm
          virtualContributor={virtualContributor}
          bokProfile={bok?.profile}
          avatar={virtualContributor.profile.avatar}
          onSave={onSave}
          hasBackNavitagion={false}
        />
      </DialogContent>
    </Dialog>
  );
};

export default EditVirtualContributorDialog;
