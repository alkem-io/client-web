import { useMemo } from 'react';
import OverflowGradient from '@/core/ui/overflow/OverflowGradient';
import { gutters } from '@/core/ui/grid/utils';
import DashboardMemberIcon from '@/domain/community/membership/DashboardMemberIcon/DashboardMemberIcon';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import Gutters from '@/core/ui/grid/Gutters';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import { ContributorViewProps } from '@/domain/community/community/EntityDashboardContributorsSection/Types';
import { MessageReceiverChipData } from '@/domain/communication/messaging/DirectMessaging/DirectMessageDialog';
import SeeMore from '@/core/ui/content/SeeMore';
import {
  CommunityMembershipStatus,
  RoleName,
  RoleSetContributorType,
  SpaceAbout,
  SpaceLevel,
} from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';

export interface SpaceWelcomeBlockProps {
  spaceAbout: {
    membership: {
      myMembershipStatus?: CommunityMembershipStatus;
      roleSetID?: string;
    };
    profile: { description?: string };
  };
}

const SpaceWelcomeBlock = ({ spaceAbout }: SpaceWelcomeBlockProps) => {
  const { t } = useTranslation();

  const { spaceLevel } = useUrlResolver();
  const navigate = useNavigate();

  const isMember = spaceAbout?.membership?.myMembershipStatus === CommunityMembershipStatus.Member;
  const description = spaceAbout?.profile?.description;

  const { organizations: leadOrganizations, users: leadUsers } = useRoleSetManager({
    roleSetId: spaceAbout?.membership?.roleSetID,
    relevantRoles: [RoleName.Lead],
    contributorTypes: [RoleSetContributorType.User, RoleSetContributorType.Organization],
    fetchContributors: true,
  });

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const leadOrganizationsUnique = useMemo(
    () => leadOrganizations?.filter(({ id }) => !leadUsers?.some(user => user.id === id)),
    [leadOrganizations, leadUsers]
  );

  return (
    <>
      {directMessageDialog}
      <OverflowGradient
        maxHeight={gutters(11)}
        overflowMarker={
          <SeeMore
            label="buttons.readMore"
            onClick={() => navigate(`./${EntityPageSection.About}`)}
            sx={{ marginTop: -1 }}
          />
        }
      >
        {isMember && <DashboardMemberIcon level={spaceLevel || SpaceLevel.L0} />}
        {description && <WrapperMarkdown disableParagraphPadding>{description}</WrapperMarkdown>}
      </OverflowGradient>
      {leadUsers && leadUsers.length > 0 && (
        <Gutters flexWrap="wrap" row disablePadding>
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
              seamless
            />
          ))}
        </Gutters>
      )}
      {leadOrganizationsUnique && leadOrganizationsUnique.length > 0 && (
        <Gutters flexWrap="wrap" row disablePadding>
          {leadOrganizationsUnique.slice(0, 2).map(org => (
            <ContributorCardHorizontal
              key={org.id}
              profile={org.profile}
              onContact={() => {
                sendMessage('organization', {
                  id: org.id,
                  displayName: org.profile.displayName,
                  avatarUri: org.profile.avatar?.uri,
                  country: org.profile.location?.country,
                  city: org.profile.location?.city,
                });
              }}
              seamless
            />
          ))}
        </Gutters>
      )}
    </>
  );
};

export default SpaceWelcomeBlock;
