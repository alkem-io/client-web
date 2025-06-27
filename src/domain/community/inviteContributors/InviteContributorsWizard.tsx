import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { Button, ButtonProps } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InviteContributorsDialog from './InviteContributorsDialog';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { Identifiable } from '@/core/utils/Identifiable';

interface InviteContributorsWizardProps extends ButtonProps {
  contributorType: RoleSetContributorType;
  filterContributors?: (contributor: Identifiable) => boolean;
  onlyFromParentCommunity?: boolean;
}

const InviteContributorsWizard = ({
  contributorType,
  startIcon = <GroupAddIcon />,
  children,
  filterContributors,
  onlyFromParentCommunity = false,
  ...buttonProps
}: InviteContributorsWizardProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setIsOpen(true)} startIcon={startIcon} {...buttonProps}>
        {children ?? t(`community.invitations.inviteButton.${contributorType}`)}
      </Button>
      <InviteContributorsDialog
        type={contributorType}
        filterContributors={filterContributors}
        open={isOpen}
        onlyFromParentCommunity={onlyFromParentCommunity}
        onClose={() => setIsOpen(false)}
      />
    </>
  );
};

export default InviteContributorsWizard;
