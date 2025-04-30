import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { Button, ButtonProps } from '@mui/material';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import InviteContributorDialog from './InviteContributorsDialog';

interface InviteContributorsButtonProps extends ButtonProps {
  contributorType: RoleSetContributorType;
}

const InviteContributorsButton = ({ contributorType, children, ...buttonProps }: InviteContributorsButtonProps) => {
  const { t } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button variant="contained" onClick={() => setIsOpen(true)} {...buttonProps}>
        {children ?? t(`community.invitations.inviteButton.${contributorType}`)}
      </Button>
      <InviteContributorDialog type={contributorType} open={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
};

export default InviteContributorsButton;
