import React, { useMemo } from 'react';
import OverflowGradient from '../../../../core/ui/overflow/OverflowGradient';
import { gutters } from '../../../../core/ui/grid/utils';
import DashboardMemberIcon from '../../../community/membership/DashboardMemberIcon/DashboardMemberIcon';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import Gutters from '../../../../core/ui/grid/Gutters';
import ContributorCardHorizontal from '../../../../core/ui/card/ContributorCardHorizontal';
import { buildOrganizationUrl, buildUserProfileUrl } from '../../../../main/routing/urlBuilders';
import {
  ContributorViewProps,
  EntityDashboardLeads,
} from '../../../community/community/EntityDashboardContributorsSection/Types';
import { MessageReceiverChipData } from '../../../communication/messaging/DirectMessaging/DirectMessageDialog';
import SeeMore from '../../../../core/ui/content/SeeMore';
import { EntityPageSection } from '../../../shared/layout/EntityPageSection';

interface JourneyDashboardWelcomeBlockProps {
  journeyTypeName: 'space' | 'subspace';
  vision: string;
  leadUsers: EntityDashboardLeads['leadUsers'];
  onContactLeadUser: (receiver: MessageReceiverChipData) => void;
  leadOrganizations: ContributorViewProps[] | undefined;
  leadVirtualContributors: ContributorViewProps[] | undefined;
  onContactLeadOrganization: (receiver: MessageReceiverChipData) => void;
  member?: boolean;
}

const JourneyDashboardWelcomeBlock = ({
  leadUsers,
  leadOrganizations,
  leadVirtualContributors,
  journeyTypeName,
  onContactLeadUser,
  onContactLeadOrganization,
  vision,
  member = false,
}: JourneyDashboardWelcomeBlockProps) => {
  const leadOrganizationsUnique = useMemo(
    () => leadOrganizations?.filter(({ id }) => !leadUsers?.some(user => user.id === id)),
    [leadOrganizations, leadUsers]
  );

  return (
    <>
      <OverflowGradient
        maxHeight={gutters(11)}
        overflowMarker={<SeeMore label="buttons.readMore" to={EntityPageSection.About} sx={{ marginTop: -1 }} />}
      >
        {member && <DashboardMemberIcon journeyTypeName={journeyTypeName} />}
        <WrapperMarkdown disableParagraphPadding>{vision}</WrapperMarkdown>
      </OverflowGradient>
      {leadUsers && leadUsers.length > 0 && (
        <Gutters flexWrap="wrap" row disablePadding>
          {leadUsers.slice(0, 2).map(user => (
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
      )}
      {leadOrganizationsUnique && leadOrganizationsUnique.length > 0 && (
        <Gutters flexWrap="wrap" row disablePadding>
          {leadOrganizationsUnique.slice(0, 2).map(org => (
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
      )}
      {leadVirtualContributors && leadVirtualContributors.length > 0 && (
        <Gutters flexWrap="wrap" row disablePadding>
          {leadVirtualContributors.slice(0, 2).map(vc => (
            <ContributorCardHorizontal key={vc.id} profile={vc.profile} url={vc.profile.url} seamless />
          ))}
        </Gutters>
      )}
    </>
  );
};

export default JourneyDashboardWelcomeBlock;
