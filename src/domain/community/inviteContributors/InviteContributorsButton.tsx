import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { Button } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InviteContributorDialog from './InviteContributorsDialog';

interface InviteContributorsButtonProps {
  contributorType: RoleSetContributorType;
}

const InviteContributorsButton = ({ contributorType }: InviteContributorsButtonProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setIsOpen(true)}>
        {t(`community.invitations.invitationDialog.inviteButton.${contributorType}`)}
      </Button>
      <InviteContributorDialog type={contributorType} open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default InviteContributorsButton;
