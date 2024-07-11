import React from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent } from '@mui/material';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import CommunityContributorsBlockWide from '../../../community/contributor/CommunityContributorsBlockWide/CommunityContributorsBlockWide';
import { useSpaceCommunityContributorsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ContributorCardSquareProps } from '../../../community/contributor/ContributorCardSquare/ContributorCardSquare';
import { ContributorType } from '../../../community/contributor/CommunityContributorsBlockWide/CommunityContributorsBlockWideContent';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { useUserContext } from '../../../community/user';
import { Caption } from '../../../../core/ui/typography';
import CommunityVirtualContributorsBlockWide from '../../../community/contributor/CommunityContributorsBlockWide/CommunityVirtualContributorsBlockWide';
import { SearchVisibility } from '../../../../core/apollo/generated/graphql-schema';
import { VirtualContributorProps } from '../../../community/community/VirtualContributorsBlock/VirtualContributorsDialog';

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

  const { loading, data } = useSpaceCommunityContributorsQuery({
    variables: {
      spaceId: journeyId,
    },
    skip: !open || !journeyId || !isAuthenticated,
  });

  const users: ContributorCardSquareProps[] | undefined = data?.lookup.space?.community.memberUsers.map(user => ({
    id: user.id,
    avatar: user.profile.visual?.uri || '',
    displayName: user.profile.displayName || '',
    url: user.profile.url,
    contributorType: ContributorType.People,
  }));

  const organizations: ContributorCardSquareProps[] | undefined = data?.lookup.space?.community.memberOrganizations.map(
    organization => ({
      id: organization.id,
      avatar: organization.profile.visual?.uri || '',
      displayName: organization.profile.displayName || '',
      url: organization.profile.url,
      contributorType: ContributorType.Organizations,
    })
  );

  const virtualContributors: VirtualContributorProps[] =
    data?.lookup.space?.community.virtualContributors.filter(vc => vc.searchVisibility !== SearchVisibility.Hidden) ??
    [];

  return (
    <DialogWithGrid open={open} fullWidth columns={12} aria-labelledby="contributors-dialog-title">
      <DialogHeader onClose={onClose} title={t('common.contributors')} />
      <DialogContent>
        {!isAuthenticated && <Caption>{t('pages.contributors.unauthorized')}</Caption>}
        {isAuthenticated && (
          <CommunityContributorsBlockWide
            users={users}
            organizations={organizations}
            isLoading={loading}
            isDialogView
          />
        )}
      </DialogContent>
      <DialogHeader title={t('pages.admin.virtualContributors.title')} />
      <DialogContent>
        <CommunityVirtualContributorsBlockWide virtualContributors={virtualContributors} isLoading={loading} />
      </DialogContent>
      <DialogHeader title={t('pages.admin.virtualContributors.title')} />
      <DialogContent>
        <CommunityVirtualContributorsBlockWide virtualContributors={virtualContributors} isLoading={loading} />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default ContributorsToggleDialog;
