import React, { ReactNode } from 'react';
import OverflowGradient from '../../../../core/ui/overflow/OverflowGradient';
import { gutters } from '../../../../core/ui/grid/utils';
import DashboardMemberIcon from '../../../community/membership/DashboardMemberIcon/DashboardMemberIcon';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import Gutters from '../../../../core/ui/grid/Gutters';
import ContributorCardHorizontal from '../../../../core/ui/card/ContributorCardHorizontal';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../../../main/routing/urlBuilders';
import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import { JourneyTypeName } from '../../JourneyTypeName';
import { EntityDashboardLeads } from '../../../community/community/EntityDashboardContributorsSection/Types';
import { MessageReceiverChipData } from '../../../communication/messaging/DirectMessaging/DirectMessageDialog';
import SeeMore from '../../../../core/ui/content/SeeMore';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';

interface MemberIconHydratorProps {
  children: ({ isMember: boolean }) => ReactNode;
}

interface JourneyDashboardWelcomeBlockProps {
  journeyTypeName: JourneyTypeName;
  vision: string;
  leadUsers: EntityDashboardLeads['leadUsers'];
  onContactLeadUser: (receiver: MessageReceiverChipData) => void;
  leadOrganizations: EntityDashboardLeads['leadOrganizations'];
  onContactLeadOrganization: (receiver: MessageReceiverChipData) => void;
  children: ({ children }: MemberIconHydratorProps) => ReactNode;
}

const JourneyDashboardWelcomeBlock = ({
  leadUsers,
  leadOrganizations,
  journeyTypeName,
  onContactLeadUser,
  onContactLeadOrganization,
  vision,
  children,
}: JourneyDashboardWelcomeBlockProps) => {
  const renderMemberIcon = ({ isMember }: { isMember: boolean }) =>
    isMember && <DashboardMemberIcon journeyTypeName={journeyTypeName} />;

  return (
    <PageContentBlock accent>
      <OverflowGradient
        maxHeight={gutters(11)}
        overflowMarker={<SeeMore label="buttons.readMore" to={EntityPageSection.About} sx={{ marginTop: -1 }} />}
      >
        {children({ children: renderMemberIcon })}
        <WrapperMarkdown disableParagraphPadding>{vision}</WrapperMarkdown>
      </OverflowGradient>
      <Gutters row disablePadding>
        {leadUsers?.slice(0, 2).map(user => (
          <ContributorCardHorizontal
            key={user.id}
            profile={user.profile}
            url={buildUserProfileUrl(user.nameID)}
            onContact={() => {
              onContactLeadUser({
                id: user.id,
                displayName: user.profile.displayName,
                avatarUri: user.profile.avatar?.uri,
                country: user.profile.location?.country,
                city: user.profile.location?.city,
              });
            }}
            seamless
          />
        ))}
      </Gutters>
      <Gutters row disablePadding>
        {leadOrganizations?.slice(0, 2).map(org => (
          <ContributorCardHorizontal
            key={org.id}
            profile={org.profile}
            url={buildOrganizationUrl(org.nameID)}
            onContact={() => {
              onContactLeadOrganization({
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
    </PageContentBlock>
  );
};

export default JourneyDashboardWelcomeBlock;
