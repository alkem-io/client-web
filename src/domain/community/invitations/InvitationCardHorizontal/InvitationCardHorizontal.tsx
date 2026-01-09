import { InvitationWithMeta } from '@/domain/community/pendingMembership/PendingMemberships';
import SpaceAvatar from '@/domain/space/components/SpaceAvatar';
import { BlockSectionTitle, CardText, Caption } from '@/core/ui/typography';
import { gutters } from '@/core/ui/grid/utils';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import BadgeCardView from '@/core/ui/list/BadgeCardView';
import DetailedActivityDescription from '@/domain/shared/components/ActivityDescription/DetailedActivityDescription';
import LinkButton from '@/core/ui/button/LinkButton';
import { formatTimeElapsed } from '@/domain/shared/utils/formatTimeElapsed';
import { useTranslation } from 'react-i18next';
import { Box } from '@mui/material';
import Gutters from '@/core/ui/grid/Gutters';

type InvitationCardHorizontalProps = {
  invitation: InvitationWithMeta | undefined;
  onClick?: () => void;
};

const InvitationCardHorizontal = ({ invitation, onClick }: InvitationCardHorizontalProps) => {
  const { t } = useTranslation();

  if (!invitation) {
    return null;
  }

  const time = formatTimeElapsed(invitation.invitation.createdDate, t);

  return (
    <BadgeCardView
      component={LinkButton}
      visual={
        <SpaceAvatar
          src={invitation.space.about.profile.cardBanner?.uri}
          spaceId={invitation.space.id}
          alt={invitation.space.about.profile.displayName}
        />
      }
      onClick={onClick}
      outlined
    >
      <Gutters disablePadding row>
        <Box flex={1}>
          <BlockSectionTitle>
            <DetailedActivityDescription
              i18nKey="community.pendingMembership.invitationCardTitle"
              spaceDisplayName={invitation.space.about.profile.displayName}
              spaceUrl={invitation.space.about.profile.url}
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
          >
            {invitation.invitation.welcomeMessage && (
              <WrapperMarkdown card plain multiline>
                {invitation.invitation.welcomeMessage}
              </WrapperMarkdown>
            )}
          </CardText>
        </Box>
        <Box display="flex" alignItems="center">
          <Caption>{time}</Caption>
        </Box>
      </Gutters>
    </BadgeCardView>
  );
};

export default InvitationCardHorizontal;
