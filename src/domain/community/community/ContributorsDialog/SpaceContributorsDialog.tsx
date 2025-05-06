import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { Box, Button, DialogActions, DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import RoleSetContributorTypesView from '../RoleSetContributors/RoleSetContributorTypesView';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import { RoleName, RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import NoOrganizations from '../RoleSetContributors/NoOrganizations';
import useOrganizationCardProps from '../utils/useOrganizationCardProps';
import useUserCardProps from '../utils/useUserCardProps';

export interface SpaceContributorsDialogProps {
  open: boolean;
  onClose: () => void;
  roleSetId: string | undefined;
}

const SpaceContributorsDialog = ({ open, onClose, roleSetId }) => {
  const { t } = useTranslation();

  const handleClose = () => {
    onClose();
  };

  const { usersByRole, organizationsByRole, loading } = useRoleSetManager({
    roleSetId,
    relevantRoles: [RoleName.Member],
    contributorTypes: [RoleSetContributorType.User, RoleSetContributorType.Organization],
    fetchContributors: true,
    skip: !roleSetId || !open,
  });
  const memberUsers = usersByRole[RoleName.Member] ?? [];
  const memberOrganizations = organizationsByRole[RoleName.Member] ?? [];

  return (
    <DialogWithGrid open={open} columns={4} fullWidth aria-labelledby="community-updates-dialog-title">
      <DialogHeader onClose={handleClose} title={t('dashboard-contributors-section.dialog-title')} />
      <DialogContent dividers>
        <Box marginBottom={2}>
          <RoleSetContributorTypesView
            organizations={useOrganizationCardProps(memberOrganizations)}
            users={useUserCardProps(memberUsers)}
            organizationsCount={memberOrganizations?.length}
            usersCount={memberUsers?.length}
            noOrganizationsView={<NoOrganizations type={'member'} />}
            loading={loading}
          />
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>{t('buttons.close')}</Button>
      </DialogActions>
    </DialogWithGrid>
  );
};

export default SpaceContributorsDialog;
