import React, { useState } from 'react';
import PageContentBlock from '../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../core/ui/content/PageContentBlockHeader';
import Gutters from '../../../core/ui/grid/Gutters';
import RadioButton from '../../shared/components/RadioButtons/RadioButton';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import { LinkOutlined } from '@mui/icons-material';
import { Caption } from '../../../core/ui/typography';
import InviteExistingUserDialog from './InviteExistingUserDialog';
import { InviteExistingUserData, InviteExternalUserData } from './useInviteUsers';
import InviteExternalUserDialog from './InviteExternalUserDialog';
import { useTranslation } from 'react-i18next';

interface InvitationOptionsBlockProps {
  spaceDisplayName: string | undefined;
  inviteExistingUser: (params: InviteExistingUserData) => Promise<void>;
  inviteExternalUser: (params: InviteExternalUserData) => Promise<void>;
  currentApplicationsUserIds: string[];
  currentInvitationsUserIds: string[];
  currentMembersIds: string[];
}

enum UserInvite {
  Existing,
  External,
}

const InvitationOptionsBlock = ({
  spaceDisplayName = '',
  inviteExistingUser,
  inviteExternalUser,
  currentApplicationsUserIds,
  currentInvitationsUserIds,
  currentMembersIds,
}: InvitationOptionsBlockProps) => {
  const [currentInvitation, setCurrentInvitation] = useState<UserInvite>();

  const closeInvitationDialog = () => setCurrentInvitation(undefined);

  const { t } = useTranslation();

  return (
    <>
      <PageContentBlock>
        <PageContentBlockHeader title={t('components.invitations.inviteOthers')} />
        <Gutters row disablePadding flexWrap="wrap">
          <RadioButton
            value=""
            iconComponent={AssignmentIndOutlinedIcon}
            size="small"
            onClick={() => setCurrentInvitation(UserInvite.Existing)}
          >
            {t('components.invitations.inviteExistingUser')}
          </RadioButton>
          <RadioButton
            value=""
            iconComponent={MailOutlineIcon}
            size="small"
            onClick={() => setCurrentInvitation(UserInvite.External)}
          >
            {t('components.invitations.inviteExternalUser')}
          </RadioButton>
          <RadioButton value="" iconComponent={LinkOutlined} size="small" disabled>
            {t('components.invitations.inviteByURL')}
          </RadioButton>
        </Gutters>
      </PageContentBlock>
      <PageContentBlock>
        <Caption textTransform="uppercase" color="muted.main" textAlign="center">
          {t('components.invitations.inviteOrganizations')}
        </Caption>
      </PageContentBlock>
      <InviteExistingUserDialog
        title={t('components.invitations.inviteExistingUserDialog.title')}
        subtitle={t('components.invitations.inviteExistingUserDialog.subtitle')}
        spaceDisplayName={spaceDisplayName}
        open={currentInvitation === UserInvite.Existing}
        onClose={closeInvitationDialog}
        onInviteUser={inviteExistingUser}
        currentApplicationsUserIds={currentApplicationsUserIds}
        currentInvitationsUserIds={currentInvitationsUserIds}
        currentMembersIds={currentMembersIds}
      />
      <InviteExternalUserDialog
        title={t('components.invitations.inviteExternalUserDialog.title')}
        open={currentInvitation === UserInvite.External}
        spaceDisplayName={spaceDisplayName}
        onClose={closeInvitationDialog}
        onInviteUser={inviteExternalUser}
      />
    </>
  );
};

export default InvitationOptionsBlock;
