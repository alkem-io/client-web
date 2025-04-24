import { useTranslation } from 'react-i18next';
import { InviteContributorDialogProps } from './InviteContributorsProps';
import VCIcon from '../virtualContributor/VirtualContributorsIcons';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';

const InviteUsersDialog = ({ open, onClose }: InviteContributorDialogProps) => {
  const { t } = useTranslation();

  return (
    <DialogWithGrid open={open} onClose={onClose} columns={12}>
      <DialogHeader
        icon={<VCIcon />}
        title={t('community.invitations.inviteContributorsDialog.title')}
        onClose={onClose}
      />
    </DialogWithGrid>
  );
};

export default InviteUsersDialog;
