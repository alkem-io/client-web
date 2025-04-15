import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Box, CircularProgress } from '@mui/material';
import AssignmentIndOutlinedIcon from '@mui/icons-material/AssignmentIndOutlined';
import MailOutlineIcon from '@mui/icons-material/MailOutline';
import PageContentBlock from '@/core/ui/content/PageContentBlock';
import PageContentBlockHeader from '@/core/ui/content/PageContentBlockHeader';
import Gutters from '@/core/ui/grid/Gutters';
import RadioButton from '@/domain/shared/components/RadioButtons/RadioButton';
import { Caption } from '@/core/ui/typography';
import { useSpaceSettingsQuery } from '@/core/apollo/generated/apollo-hooks';
import InviteExistingUserDialog from './InviteExistingUserDialog';
import InviteExternalUserDialog from './InviteExternalUserDialog';
import { RoleName } from '@/core/apollo/generated/graphql-schema';
import { InviteContributorsData } from '@/domain/access/model/InvitationDataModel';

type InvitationOptionsBlockProps = {
  spaceDisplayName: string | undefined;
  inviteUsers: (params: InviteContributorsData) => Promise<unknown>;
  currentApplicationsUserIds: string[];
  currentInvitationsUserIds: string[];
  currentMembersIds: string[];
  parentSpaceId: string | undefined;
  isSubspace?: boolean;
};

enum UserInvite {
  Existing,
  External,
}

const AVAILABLE_COMMUNITY_ROLES = [RoleName.Member, RoleName.Admin, RoleName.Lead] as const;

const InvitationOptionsBlock = ({
  spaceDisplayName = '',
  inviteUsers,
  currentApplicationsUserIds,
  currentInvitationsUserIds,
  currentMembersIds,
  parentSpaceId,
  isSubspace = false,
}: InvitationOptionsBlockProps) => {
  const [currentInvitation, setCurrentInvitation] = useState<UserInvite>();

  const closeInvitationDialog = () => setCurrentInvitation(undefined);

  const { t } = useTranslation();

  const { data, loading } = useSpaceSettingsQuery({
    variables: {
      spaceId: parentSpaceId!,
    },
    skip: !parentSpaceId,
  });

  // setting of the parent
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
        onInviteUser={inviteUsers}
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
        onInviteUser={inviteUsers}
        communityRoles={AVAILABLE_COMMUNITY_ROLES}
      />
    </>
  );
};

export default InvitationOptionsBlock;
