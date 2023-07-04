import React from 'react';
import { useTranslation } from 'react-i18next';
import { InvitationWithMeta } from '../../pendingMembership/usePendingMemberships';
import RouterLink from '../../../../core/ui/link/RouterLink';
import JourneyAvatar from '../../../challenge/common/JourneyAvatar/JourneyAvatar';
import { BlockSectionTitle, CardText } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import WrapperMarkdown from '../../../../core/ui/markdown/WrapperMarkdown';
import BadgeCardView from '../../../../core/ui/list/BadgeCardView';

interface InvitationCardHorizontalProps {
  invitation: InvitationWithMeta;
}

const InvitationCardHorizontal = ({ invitation }: InvitationCardHorizontalProps) => {
  const { t } = useTranslation();

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
      <BlockSectionTitle noWrap>{t('community.pendingMembership.invitationTitle')}</BlockSectionTitle>
      <CardText
        sx={{
          img: {
            maxHeight: gutters(1),
          },
        }}
        noWrap
      >
        <WrapperMarkdown card flat>
          Hi Simone, I would like to invite you to join this Challenge, I have some amazing reasons for that which i will share with you but that won’t fit on one line and therefore this text needs to be truncated after I don’t know how many characters Hi Simone, I would like to invite you to join this Challenge, I have some amazing reasons for that which i will share with you but that won’t fit on one line and therefore this text needs to be truncated after I don’t know how many characters
        </WrapperMarkdown>
      </CardText>
    </BadgeCardView>
  );
};

export default InvitationCardHorizontal;