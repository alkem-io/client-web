import React from 'react';
import { useTranslation } from 'react-i18next';
import { DialogContent } from '@mui/material';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import CommunityContributorsBlockWide from '../../../community/contributor/CommunityContributorsBlockWide/CommunityContributorsBlockWide';
import { useSpaceCommunityContributorsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { ContributorCardSquareProps } from '../../../community/contributor/ContributorCardSquare/ContributorCardSquare';
import { ContributorType } from '../../../community/contributor/CommunityContributorsBlockWide/CommunityContributorsBlockWideContent';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';

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
  const { t } = useTranslation();

  const { loading, data } = useSpaceCommunityContributorsQuery({
    variables: {
      spaceId: journeyId,
    },
    skip: !open || !journeyId,
  });

  const users: ContributorCardSquareProps[] | undefined = data?.lookup.space?.community?.memberUsers.map(user => ({
    id: user.id,
    avatar: user.profile?.visual?.uri || '',
    displayName: user.profile?.displayName || '',
    url: `/users/${user.nameID}`,
    contributorType: ContributorType.People,
  }));

  const organizations: ContributorCardSquareProps[] | undefined =
    data?.lookup.space?.community?.memberOrganizations.map(organization => ({
      id: organization.id,
      avatar: organization.profile?.visual?.uri || '',
      displayName: organization.profile?.displayName || '',
      url: `/organization/${organization.nameID}`,
      contributorType: ContributorType.Organizations,
    }));

  return (
    <DialogWithGrid open={open} fullWidth columns={12} aria-labelledby="contributors-dialog-title">
      <DialogHeader onClose={onClose} title={t('common.contributors')} />
      <DialogContent>
        <CommunityContributorsBlockWide users={users} organizations={organizations} isLoading={loading} isDialogView />
      </DialogContent>
    </DialogWithGrid>
  );
};

export default ContributorsToggleDialog;
