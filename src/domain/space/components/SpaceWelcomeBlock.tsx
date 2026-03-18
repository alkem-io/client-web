import { useTranslation } from 'react-i18next';
import { ActorType, CommunityMembershipStatus, RoleName, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import Gutters from '@/core/ui/grid/Gutters';
import SwapColors from '@/core/ui/palette/SwapColors';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import DashboardMemberIcon from '@/domain/community/membership/DashboardMemberIcon/DashboardMemberIcon';
import { SPACE_LAYOUT_EDIT_PATH, SUBSPACE_ABOUT_EDIT_PATH } from '@/domain/space/constants/spaceEditPaths';
import useSpaceTabProvider from '@/domain/space/layout/tabbedLayout/SpaceTabProvider';
import useCurrentTabPosition from '@/domain/space/layout/tabbedLayout/useCurrentTabPosition';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import ExpandableDescription from './ExpandableDescription';

export interface SpaceWelcomeBlockProps {
  spaceAbout: {
    membership: {
      myMembershipStatus?: CommunityMembershipStatus | string;
      roleSetID?: string;
    };
    profile: { description?: string };
  };
  description?: string; // explicitly passing description to support both the tabDescription and the about's description
  canEdit?: boolean; // optional override for subspaces where edit permission comes from subspace privileges
}

const SpaceWelcomeBlock = ({ spaceAbout, description, canEdit: canEditProp }: SpaceWelcomeBlockProps) => {
  const { t } = useTranslation();
  const { spaceLevel } = useUrlResolver();

  const isMember = spaceAbout?.membership?.myMembershipStatus === CommunityMembershipStatus.Member;
  const welcomeDescription = description ?? spaceAbout?.profile?.description;

  const { organizations: leadOrganizations, users: leadUsers } = useRoleSetManager({
    roleSetId: spaceAbout?.membership?.roleSetID,
    relevantRoles: [RoleName.Lead],
    contributorTypes: [ActorType.User, ActorType.Organization],
    fetchContributors: true,
  });

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const isL0 = spaceLevel === SpaceLevel.L0;
  const tabPosition = useCurrentTabPosition();
  const { canEditInnovationFlow } = useSpaceTabProvider({ tabPosition, skip: canEditProp !== undefined });
  // For L0 spaces, use innovation flow permission; for subspaces, use passed prop if provided
  const canEdit = canEditProp ?? canEditInnovationFlow;
  const editPath = isL0 ? SPACE_LAYOUT_EDIT_PATH : SUBSPACE_ABOUT_EDIT_PATH;

  const showMemberIcon = isMember && !canEdit;

  return (
    <>
      <SwapColors swap={true}>{directMessageDialog}</SwapColors>
      <ExpandableDescription
        description={welcomeDescription}
        editPath={editPath}
        canEdit={canEdit}
        disableParagraphPadding={true}
        useEditTab={isL0}
        headerSlot={showMemberIcon ? <DashboardMemberIcon level={spaceLevel || SpaceLevel.L0} /> : undefined}
      />
      {(leadUsers.length > 0 || leadOrganizations.length > 0) && (
        <Gutters flexWrap="wrap" row={true} disablePadding={true}>
          {leadUsers.slice(0, 2).map(user => (
            <ContributorCardHorizontal
              key={user.id}
              profile={user.profile}
              onContact={() => {
                sendMessage('user', {
                  id: user.id,
                  displayName: user.profile?.displayName,
                  avatarUri: user.profile?.avatar?.uri,
                  country: user.profile?.location?.country,
                  city: user.profile?.location?.city,
                });
              }}
              seamless={true}
            />
          ))}
          {leadOrganizations.slice(0, 2).map(org => (
            <ContributorCardHorizontal
              key={org.id}
              profile={org.profile}
              onContact={() => {
                sendMessage('organization', {
                  id: org.id,
                  displayName: org.profile?.displayName,
                  avatarUri: org.profile?.avatar?.uri,
                  country: org.profile?.location?.country,
                  city: org.profile?.location?.city,
                });
              }}
              seamless={true}
            />
          ))}
        </Gutters>
      )}
    </>
  );
};

export default SpaceWelcomeBlock;
