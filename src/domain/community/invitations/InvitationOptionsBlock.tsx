import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CircularProgress } from '@mui/material';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import Gutters from '@/core/ui/grid/Gutters';
import RadioButton from '../../shared/components/RadioButtons/RadioButton';
import { Caption } from '@/core/ui/typography';
import { useSpaceSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import InviteExistingUserDialog from './InviteExistingUserDialog';
import { InviteContributorsData, InviteExternalUserData } from './useInviteUsers';
import InviteExternalUserDialog from './InviteExternalUserDialog';
import { CommunityRoleType } from '@/core/apollo/generated/graphql-schema';

interface InvitationOptionsBlockProps {
  spaceDisplayName: string | undefined;
  inviteExistingUser: (params: InviteContributorsData) => Promise<void>;
  inviteExternalUser: (params: InviteExternalUserData) => Promise<void>;
  currentApplicationsUserIds: string[];
  currentInvitationsUserIds: string[];
  currentMembersIds: string[];
  spaceId: string | undefined;
  isSubspace?: boolean;
}

enum UserInvite {
  Existing,
  External,
}

const AVAILABLE_COMMUNITY_ROLES = [CommunityRoleType.Member, CommunityRoleType.Admin, CommunityRoleType.Lead] as const;

const InvitationOptionsBlock = ({
  spaceDisplayName = '',
  inviteExistingUser,
  inviteExternalUser,
  currentApplicationsUserIds,
  currentInvitationsUserIds,
  currentMembersIds,
  spaceId,
  isSubspace = false,
}: InvitationOptionsBlockProps) => {
  const [currentInvitation, setCurrentInvitation] = useState<UserInvite>();

  const closeInvitationDialog = () => setCurrentInvitation(undefined);

  const { t } = useTranslation();

  const { data, loading } = useSpaceSettingsQuery({
    variables: {
      spaceId: spaceId!,
    },
    skip: !spaceId,
  });

  const allowSubspaceAdminsToInviteMembers = data?.lookup.space?.settings.membership.allowSubspaceAdminsToInviteMembers;
  const showInviteBlock = isSubspace ? allowSubspaceAdminsToInviteMembers : true; // for Spaces the block is always visible

  return loading ? (
    <Box marginX="auto">
      <CircularProgress />
    </Box>
  ) : (
    <>
      {showInviteBlock && (
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
          </Gutters>
        </PageContentBlock>
      )}
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
        communityRoles={AVAILABLE_COMMUNITY_ROLES}
      />
      <InviteExternalUserDialog
        title={t('components.invitations.inviteExternalUserDialog.title')}
        open={currentInvitation === UserInvite.External}
        spaceDisplayName={spaceDisplayName}
        onClose={closeInvitationDialog}
        onInviteUser={inviteExternalUser}
        communityRoles={AVAILABLE_COMMUNITY_ROLES}
      />
    </>
  );
};

export default InvitationOptionsBlock;
