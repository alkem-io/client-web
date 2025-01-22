import React from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import CommunityContributorsBlockWide from '@/domain/community/contributor/CommunityContributorsBlockWide/CommunityContributorsBlockWide';
import { useSubspaceCommunityAndRoleSetIdQuery } from '@/core/apollo/generated/apollo-hooks';
import { ContributorCardSquareProps } from '@/domain/community/contributor/ContributorCardSquare/ContributorCardSquare';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useUserContext } from '@/domain/community/user';
import { BlockTitle, Caption } from '@/core/ui/typography';
import CommunityVirtualContributorsBlockWide from '@/domain/community/contributor/CommunityContributorsBlockWide/CommunityVirtualContributorsBlockWide';
import { RoleName, RoleSetContributorType, SearchVisibility } from '@/core/apollo/generated/graphql-schema';
import { VirtualContributorProps } from '@/domain/community/community/VirtualContributorsBlock/VirtualContributorsDialog';
import Gutters from '@/core/ui/grid/Gutters';
import useRoleSetAdmin from '@/domain/access/RoleSet/RoleSetAdmin/useRoleSetAdmin';

export interface ContributorsToggleDialogProps {
  open?: boolean;
  onClose?: () => void;
  journeyId: string;
}

/**
 * Represents a dialog component that displays contributors in a journey (space, subspace, subsubspace).
 * @param journeyId is a spaceId from the context.
 */
const ContributorsToggleDialog = ({ open = false, journeyId, onClose }: ContributorsToggleDialogProps) => {
  const { isAuthenticated } = useUserContext();
  const { t } = useTranslation();

  const { data: subspaceData, loading } = useSubspaceCommunityAndRoleSetIdQuery({
    variables: {
      spaceId: journeyId,
    },
    skip: !open || !journeyId,
  });
  const roleSetId = subspaceData?.lookup.space?.community.roleSet.id;

  const { usersByRole, organizationsByRole, virtualContributorsByRole } = useRoleSetAdmin({
    roleSetId,
    relevantRoles: [RoleName.Member],
    contributorTypes: [RoleSetContributorType.User, RoleSetContributorType.Organization],
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
            <CommunityContributorsBlockWide
              showUsers
              users={users}
              organizations={organizations}
              isLoading={loading}
              isDialogView
            />
            {virtualContributors && virtualContributors?.length > 0 && (
              <>
                <BlockTitle>{t('pages.contributors.virtualContributors.title')}</BlockTitle>
                <CommunityVirtualContributorsBlockWide virtualContributors={virtualContributors} />
              </>
            )}
          </Gutters>
        )}
      </DialogContent>
    </DialogWithGrid>
  );
};

export default ContributorsToggleDialog;
