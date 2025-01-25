import { InvitationWithMeta } from '@/domain/community/pendingMembership/PendingMemberships';
import JourneyAvatar from '@/domain/journey/common/JourneyAvatar/JourneyAvatar';
import { BlockSectionTitle, CardText } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import DetailedActivityDescription from '@/domain/shared/components/ActivityDescription/DetailedActivityDescription';
import LinkButton from '@/core/ui/button/LinkButton';
import { getChildSpaceLevel } from '@/domain/shared/utils/spaceLevel';

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
      visual={<JourneyAvatar src={invitation.space.profile.visual?.uri} />}
      onClick={onClick}
      outlined
    >
      <BlockSectionTitle noWrap>
        <DetailedActivityDescription
          i18nKey="community.pendingMembership.invitationTitle"
          journeyDisplayName={invitation.space.profile.displayName}
          journeyUrl={invitation.space.profile.url}
          journeyTypeName={getChildSpaceLevel(invitation.space)}
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
