import { InvitationWithMeta } from '@/domain/community/pendingMembership/PendingMemberships';
import JourneyAvatar from '@/domain/journey/common/JourneyAvatar/JourneyAvatar';
import { BlockSectionTitle, CardText } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import DetailedActivityDescription from '@/domain/shared/components/ActivityDescription/DetailedActivityDescription';
import LinkButton from '@/core/ui/button/LinkButton';

type InvitationCardHorizontalProps = {
  invitation: InvitationWithMeta | undefined;
  onClick?: () => void;
};

const InvitationCardHorizontal = ({ invitation, onClick }: InvitationCardHorizontalProps) => {
  if (!invitation) {
    return null;
  }

  return (
    <BadgeCardView
      component={LinkButton}
      visual={<JourneyAvatar src={invitation.space.about.profile.cardBanner?.uri} />}
      onClick={onClick}
      outlined
    >
      <BlockSectionTitle noWrap>
        <DetailedActivityDescription
          i18nKey="community.pendingMembership.invitationTitle"
          journeyDisplayName={invitation.space.about.profile.displayName}
          journeyUrl={invitation.space.about.profile.url}
          spaceLevel={invitation.space.level}
          createdDate={invitation.invitation.createdDate}
          author={{ displayName: invitation.userDisplayName }}
          type={invitation.invitation.contributorType}
        />
      </BlockSectionTitle>
      <CardText
        sx={{
          img: {
            maxHeight: gutters(1),
          },
        }}
        noWrap
      >
        {invitation.invitation.welcomeMessage && (
          <WrapperMarkdown card plain>
            {invitation.invitation.welcomeMessage}
          </WrapperMarkdown>
        )}
      </CardText>
    </BadgeCardView>
  );
};

export default InvitationCardHorizontal;
