import { useTranslation } from 'react-i18next';
import { ActorType, RoleName } from '@/core/apollo/generated/graphql-schema';
import { SpaceMembers } from '@/crd/components/space/SpaceMembers';
import { SubspaceCommunityDialog } from '@/crd/components/space/SubspaceCommunityDialog';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import { mapRoleSetToMemberCards } from '../../space/dataMappers/communityDataMapper';

type CrdSubspaceCommunityDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roleSetId: string | undefined;
  /** Optional title override; defaults to t('crd-subspace:community.dialogTitle'). */
  title?: string;
  description?: string;
};

export function CrdSubspaceCommunityDialogConnector({
  open,
  onOpenChange,
  roleSetId,
  title,
  description,
}: CrdSubspaceCommunityDialogConnectorProps) {
  const { t } = useTranslation('crd-subspace');

  const { users, organizations, loading } = useRoleSetManager({
    roleSetId,
    relevantRoles: [RoleName.Admin, RoleName.Lead, RoleName.Member],
    contributorTypes: [ActorType.User, ActorType.Organization],
    fetchContributors: open,
    skip: !open,
  });

  const members = mapRoleSetToMemberCards(users, organizations);

  return (
    <SubspaceCommunityDialog
      open={open}
      onOpenChange={onOpenChange}
      title={title ?? t('community.dialogTitle')}
      description={description ?? t('community.dialogDescription')}
      closeLabel={t('a11y.close')}
    >
      <SpaceMembers
        members={members}
        usersCount={users.length}
        organizationsCount={organizations.length}
        pageSize={9}
        // Loading state is briefly visible — SpaceMembers shows its empty state otherwise.
        // No `loading` prop on SpaceMembers; rely on the dialog being open + members updating.
        title={title ?? t('community.dialogTitle')}
        subtitle={loading ? '' : undefined}
      />
    </SubspaceCommunityDialog>
  );
}
