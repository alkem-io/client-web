import React from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import RoleSetContributorTypesBlockWide from '@/domain/community/contributor/RoleSetContributorTypesBlockWide/RoleSetContributorTypesBlockWide';
import { useSpaceRoleSetContributorTypesQuery } from '@/core/apollo/generated/apollo-hooks';
import { ContributorCardSquareProps } from '@/domain/community/contributor/ContributorCardSquare/ContributorCardSquare';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import { useUserContext } from '@/domain/community/user';
import { BlockTitle, Caption } from '@/core/ui/typography';
import CommunityVirtualContributorsBlockWide from '@/domain/community/contributor/RoleSetContributorTypesBlockWide/CommunityVirtualContributorsBlockWide';
import { RoleSetContributorType, SearchVisibility } from '@/core/apollo/generated/graphql-schema';
import { VirtualContributorProps } from '@/domain/community/community/VirtualContributorsBlock/VirtualContributorsDialog';
import Gutters from '@/core/ui/grid/Gutters';

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

  const { loading, data } = useSpaceRoleSetContributorTypesQuery({
    variables: {
      spaceId: journeyId,
    },
    skip: !open || !journeyId || !isAuthenticated,
  });
  const roleSet = data?.lookup.space?.community?.roleSet;

  const users: ContributorCardSquareProps[] | undefined = roleSet?.memberUsers.map(user => ({
    id: user.id,
    avatar: user.profile.visual?.uri || '',
    displayName: user.profile.displayName || '',
    url: user.profile.url,
    contributorType: RoleSetContributorType.User,
  }));

  const organizations: ContributorCardSquareProps[] | undefined = roleSet?.memberOrganizations.map(organization => ({
    id: organization.id,
    avatar: organization.profile.visual?.uri || '',
    displayName: organization.profile.displayName || '',
    url: organization.profile.url,
    contributorType: RoleSetContributorType.Organization,
  }));

  const virtualContributors: VirtualContributorProps[] =
    roleSet?.virtualContributors.filter(vc => vc.searchVisibility !== SearchVisibility.Hidden) ?? [];

  return (
    <DialogWithGrid open={open} fullWidth columns={12} aria-labelledby="contributors-dialog-title">
      <DialogHeader onClose={onClose} title={t('common.contributors')} />
      <DialogContent>
        {!isAuthenticated && <Caption>{t('pages.contributors.unauthorized')}</Caption>}
        {isAuthenticated && (
          <Gutters disablePadding>
            <RoleSetContributorTypesBlockWide
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
