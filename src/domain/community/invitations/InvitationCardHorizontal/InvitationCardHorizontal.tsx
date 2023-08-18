import React from 'react';
import { InvitationWithMeta } from '../../pendingMembership/PendingMemberships';
import JourneyAvatar from '../../../journey/common/JourneyAvatar/JourneyAvatar';
import { BlockSectionTitle, CardText } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import ActivityDescription from '../../../shared/components/ActivityDescription/ActivityDescription';
import LinkButton from '../../../../core/ui/button/LinkButton';

interface InvitationCardHorizontalProps {
  invitation: InvitationWithMeta | undefined;
  onClick?: () => void;
}

const InvitationCardHorizontal = ({ invitation, onClick }: InvitationCardHorizontalProps) => {
  if (!invitation) {
    return null;
  }

  return (
    <BadgeCardView
      component={LinkButton}
      visual={<JourneyAvatar journeyTypeName="space" visualUri={undefined} />}
      onClick={onClick}
      outlined
    >
      <BlockSectionTitle noWrap>
        <ActivityDescription
          i18nKey="community.pendingMembership.invitationTitle"
          {...invitation}
          author={{ displayName: invitation.userDisplayName }}
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
        {invitation.welcomeMessage && (
          <WrapperMarkdown card flat>
            {invitation.welcomeMessage}
          </WrapperMarkdown>
        )}
      </CardText>
    </BadgeCardView>
  );
};

export default InvitationCardHorizontal;
