import React from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { InvitationWithMeta } from '../../pendingMembership/usePendingMemberships';
import RouterLink from '../../../../core/ui/link/RouterLink';
import JourneyAvatar from '../../../challenge/common/JourneyAvatar/JourneyAvatar';
import { BlockSectionTitle, CardText } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';
import journeyIcon from '../../../shared/components/JourneyIcon/JourneyIcon';
import ActivityDescription from '../../../shared/components/ActivityDescription/ActivityDescription';

interface InvitationCardHorizontalProps {
  invitation: InvitationWithMeta | undefined;
}

const InvitationCardHorizontal = ({ invitation }: InvitationCardHorizontalProps) => {
  // const { t } = useTranslation();

  if (!invitation) {
    return null; // TODO Skeleton
  }

  const JourneyIcon = journeyIcon[invitation.journeyTypeName];

  return (
    <BadgeCardView
      component={RouterLink}
      to={''}
      visual={
        <JourneyAvatar
          journeyTypeName="space"
          visualUri={undefined}
        />
      }
    >
      <BlockSectionTitle noWrap>
        <ActivityDescription
          i18nKey="community.pendingMembership.invitationTitle"
          {...invitation}
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