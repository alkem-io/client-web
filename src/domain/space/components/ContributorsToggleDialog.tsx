import React from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import RoleSetContributorsBlockWide from '@/domain/community/contributor/RoleSetContributorsBlockWide/RoleSetContributorsBlockWide';
import { useSubspaceCommunityAndRoleSetIdQuery } from '@/core/apollo/generated/apollo-hooks';
import { ContributorCardSquareProps } from '@/domain/community/contributor/ContributorCardSquare/ContributorCardSquare';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { BlockTitle, Caption } from '@/core/ui/typography';
import RoleSetVirtualContributorsBlockWide from '@/domain/community/contributor/RoleSetContributorsBlockWide/RoleSetVirtualContributorsBlockWide';
import { RoleName, RoleSetContributorType, SearchVisibility } from '@/core/apollo/generated/graphql-schema';
import { VirtualContributorProps } from '@/domain/community/community/VirtualContributorsBlock/VirtualContributorsDialog';
import Gutters from '@/core/ui/grid/Gutters';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

export interface ContributorsToggleDialogProps {
  open?: boolean;
  onClose?: () => void;
}

/**
 * Represents a dialog component that displays contributors in a space, subspace, subsubspace
 */
const ContributorsToggleDialog = ({ open = false, onClose }: ContributorsToggleDialogProps) => {
  const { isAuthenticated } = useCurrentUserContext();
  const { t } = useTranslation();
  const { spaceId } = useUrlResolver();

  const { data: subspaceData, loading } = useSubspaceCommunityAndRoleSetIdQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !open || !spaceId,
  });
  const roleSetId = subspaceData?.lookup.space?.community.roleSet.id;

  const { usersByRole, organizationsByRole, virtualContributorsByRole } = useRoleSetManager({
    roleSetId,
    relevantRoles: [RoleName.Member],
    contributorTypes: [RoleSetContributorType.User, RoleSetContributorType.Organization],
    fetchContributors: true,
  });
  const memberUsers = usersByRole[RoleName.Member] ?? [];
  const memberOrganizations = organizationsByRole[RoleName.Member] ?? [];
  const memberVirtualContributors = virtualContributorsByRole[RoleName.Member] ?? [];

  const users: ContributorCardSquareProps[] | undefined = memberUsers.map(user => ({
    id: user.id,
    avatar: user.profile.avatar?.uri,
    displayName: user.profile.displayName,
    url: user.profile.url,
    contributorType: RoleSetContributorType.User,
  }));

  const organizations: ContributorCardSquareProps[] | undefined = memberOrganizations.map(organization => ({
    id: organization.id,
    avatar: organization.profile.avatar?.uri,
    displayName: organization.profile.displayName,
    url: organization.profile.url,
    contributorType: RoleSetContributorType.Organization,
  }));

  const virtualContributors: VirtualContributorProps[] =
    memberVirtualContributors.filter(vc => vc.searchVisibility !== SearchVisibility.Hidden) ?? [];

  return (
    <DialogWithGrid open={open} fullWidth columns={12} aria-labelledby="contributors-dialog-title">
      <DialogHeader onClose={onClose} title={t('common.contributors')} />
      <DialogContent>
        {!isAuthenticated && <Caption>{t('pages.contributors.unauthorized')}</Caption>}
        {isAuthenticated && (
          <Gutters disablePadding>
            <RoleSetContributorsBlockWide
              showUsers
              users={users}
              organizations={organizations}
              isLoading={loading}
              isDialogView
            />
            {virtualContributors && virtualContributors?.length > 0 && (
              <>
                <BlockTitle>{t('pages.contributors.virtualContributors.title')}</BlockTitle>
                <RoleSetVirtualContributorsBlockWide virtualContributors={virtualContributors} />
              </>
            )}
          </Gutters>
        )}
      </DialogContent>
    </DialogWithGrid>
  );
};

export default ContributorsToggleDialog;
