import { useState } from 'react';
import OverflowGradient from '@/core/ui/overflow/OverflowGradient';
import { gutters } from '@/core/ui/grid/utils';
import DashboardMemberIcon from '@/domain/community/membership/DashboardMemberIcon/DashboardMemberIcon';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import Gutters from '@/core/ui/grid/Gutters';
import ContributorCardHorizontal from '@/core/ui/card/ContributorCardHorizontal';
import SeeMore from '@/core/ui/content/SeeMore';
import {
  CommunityMembershipStatus,
  RoleName,
  RoleSetContributorType,
  SpaceLevel,
} from '@/core/apollo/generated/graphql-schema';
import { useTranslation } from 'react-i18next';
import { EntityPageSection } from '@/domain/shared/layout/EntityPageSection';
import useRoleSetManager from '@/domain/access/RoleSetManager/useRoleSetManager';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useDirectMessageDialog from '@/domain/communication/messaging/DirectMessaging/useDirectMessageDialog';
import SwapColors from '@/core/ui/palette/SwapColors';
import { useNavigate } from 'react-router-dom';
import { Box, IconButton } from '@mui/material';
import { EditOutlined } from '@mui/icons-material';
import { SettingsSection } from '@/domain/platformAdmin/layout/EntitySettingsLayout/SettingsSection';

export interface SpaceWelcomeBlockProps {
  spaceAbout: {
    membership: {
      myMembershipStatus?: CommunityMembershipStatus | string;
      roleSetID?: string;
    };
    profile: { description?: string };
  };
  description?: string; // explicitly passing description to support both the tabDescription and the about's description
  canEdit?: boolean;
}

const SpaceWelcomeBlock = ({ spaceAbout, description, canEdit = false }: SpaceWelcomeBlockProps) => {
  const { t } = useTranslation();

  const { spaceLevel } = useUrlResolver();
  const navigate = useNavigate();

  const [isExpanded, setIsExpanded] = useState(false);

  const isMember = spaceAbout?.membership?.myMembershipStatus === CommunityMembershipStatus.Member;
  const welcomeDescription = description ?? spaceAbout?.profile?.description;

  const { organizations: leadOrganizations, users: leadUsers } = useRoleSetManager({
    roleSetId: spaceAbout?.membership?.roleSetID,
    relevantRoles: [RoleName.Lead],
    contributorTypes: [RoleSetContributorType.User, RoleSetContributorType.Organization],
    fetchContributors: true,
  });

  const { sendMessage, directMessageDialog } = useDirectMessageDialog({
    dialogTitle: t('send-message-dialog.direct-message-title'),
  });

  const handleEditClick = () => {
    navigate(`./${EntityPageSection.Settings}/${SettingsSection.Layout}`);
  };

  const handleExpandToggle = () => {
    setIsExpanded(prev => !prev);
  };

  return (
    <>
      <SwapColors swap>{directMessageDialog}</SwapColors>
      {canEdit && (
        <Box display="flex" justifyContent="flex-end">
          <IconButton onClick={handleEditClick} size="small" sx={{ color: 'primary.main' }}>
            <EditOutlined />
          </IconButton>
        </Box>
      )}
      {isExpanded ? (
        <>
          {isMember && <DashboardMemberIcon level={spaceLevel || SpaceLevel.L0} />}
          {welcomeDescription && <WrapperMarkdown disableParagraphPadding>{welcomeDescription}</WrapperMarkdown>}
          <SeeMore label="buttons.showLess" onClick={handleExpandToggle} sx={{ marginTop: -1 }} />
        </>
      ) : (
        <OverflowGradient
          maxHeight={gutters(11)}
          overflowMarker={<SeeMore label="buttons.readMore" onClick={handleExpandToggle} sx={{ marginTop: -1 }} />}
        >
          {isMember && <DashboardMemberIcon level={spaceLevel || SpaceLevel.L0} />}
          {welcomeDescription && <WrapperMarkdown disableParagraphPadding>{welcomeDescription}</WrapperMarkdown>}
        </OverflowGradient>
      )}
      {(leadUsers.length > 0 || leadOrganizations.length > 0) && (
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
          {leadOrganizations.slice(0, 2).map(org => (
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
