import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { Button, ButtonProps } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InviteContributorsDialog from './InviteContributorsDialog';
import GroupAddIcon from '@mui/icons-material/GroupAdd';

interface InviteContributorsWizardProps extends ButtonProps {
  contributorType: RoleSetContributorType;
}

const InviteContributorsWizard = ({
  contributorType,
  startIcon = <GroupAddIcon />,
  children,
  ...buttonProps
}: InviteContributorsWizardProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setIsOpen(true)} startIcon={startIcon} {...buttonProps}>
        {children ?? t(`community.invitations.inviteButton.${contributorType}`)}
      </Button>
      <InviteContributorsDialog type={contributorType} open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default InviteContributorsWizard;
