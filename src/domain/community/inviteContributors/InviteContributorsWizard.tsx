import GroupAddIcon from '@mui/icons-material/GroupAdd';
import { Button, type ButtonProps } from '@mui/material';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { ActorType } from '@/core/apollo/generated/graphql-schema';
import type { Identifiable } from '@/core/utils/Identifiable';
import InviteContributorsDialog from './InviteContributorsDialog';

interface InviteContributorsWizardProps extends ButtonProps {
  contributorType: ActorType;
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
