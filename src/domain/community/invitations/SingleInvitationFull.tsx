import { ReactNode } from 'react';
import { InvitationHydrator, InvitationWithMeta } from '../pendingMembership/PendingMemberships';
import Gutters from '@/core/ui/grid/Gutters';
import { CheckOutlined, HdrStrongOutlined } from '@mui/icons-material';
import SpaceCardBase from '@/domain/space/components/cards/SpaceCardBase';
import SpaceCardTagline from '@/domain/space/components/cards/components/SpaceCardTagline';
import { BlockSectionTitle, Caption, Text } from '@/core/ui/typography';
import DetailedActivityDescription from '@/domain/shared/components/ActivityDescription/DetailedActivityDescription';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { PendingInvitationItem } from '../user/models/PendingInvitationItem';
import { useTranslation } from 'react-i18next';
import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { Box, Button } from '@mui/material';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import References from '@/domain/shared/components/References/References';
import { gutters } from '@/core/ui/grid/utils';
import FlexSpacer from '@/core/ui/utils/FlexSpacer';
import { Actions } from '@/core/ui/actions/Actions';
import { useScreenSize } from '@/core/ui/grid/constants';

type SingleInvitationFullProps = {
  invitation: PendingInvitationItem | undefined;
  updating: boolean;
  acceptInvitation: (invitationId: string, spaceUrl: string) => void;
  accepting: boolean;
  rejectInvitation: (invitationId: string) => void;
  rejecting: boolean;
  actions?: ReactNode;
};

/**
 * SingleInvitationFull Component
 *
 * This component is a copy of `src/domain/community/invitations/InvitationDialog.tsx`.
 * It is almost the same but without the Dialog functionalities.
 * In the future, it could be refactored to use the same component or to be simplified.
 *
 * @component
 */
const SingleInvitationFull = ({
  invitation,
  updating,
  acceptInvitation,
  accepting,
  rejectInvitation,
  rejecting,
  actions,
}: SingleInvitationFullProps) => {
  const { t } = useTranslation();

  const { isSmallScreen } = useScreenSize();

  const getTitle = (invitation: InvitationWithMeta) => {
    if (invitation.invitation.contributorType === RoleSetContributorType.Virtual) {
      return t('community.pendingMembership.invitationDialog.vc.title', {
        space: invitation?.space.about.profile.displayName,
      });
    }

    return t('community.pendingMembership.invitationDialog.title', {
      space: invitation?.space.about.profile.displayName,
    });
  };

  const getAcceptLabel = (invitation: InvitationWithMeta) => {
    if (invitation.invitation.contributorType === RoleSetContributorType.Virtual) {
      return t('community.pendingMembership.invitationDialog.actions.accept');
    }

    return t('community.pendingMembership.invitationDialog.actions.join');
  };

  return (
    <>
      {invitation && (
        <InvitationHydrator invitation={invitation} withCommunityGuidelines>
          {({ invitation, communityGuidelines }) =>
            invitation && (
              <>
                <Gutters row disablePadding sx={{ whiteSpace: 'break-spaces' }}>
                  <HdrStrongOutlined fontSize="small" />
                  {getTitle(invitation)}
                </Gutters>
                <Gutters
                  paddingTop={0}
                  flexDirection={isSmallScreen ? 'column' : 'row'}
                  alignItems={isSmallScreen ? 'center' : 'start'}
                >
                  <SpaceCardBase
                    header={invitation.space.about.profile.displayName}
                    tags={invitation.space.about.profile.tagset?.tags ?? []}
                    banner={invitation.space.about.profile.cardBanner}
                    spaceUri={invitation.space.about.profile.url}
                  >
                    <SpaceCardTagline>{invitation.space.about.profile.tagline ?? ''}</SpaceCardTagline>
                  </SpaceCardBase>
                  <Gutters disablePadding>
                    <Caption>
                      <DetailedActivityDescription
                        i18nKey="community.pendingMembership.invitationTitle"
                        spaceDisplayName={invitation.space.about.profile.displayName}
                        spaceUrl={invitation.space.about.profile.url}
                        spaceLevel={invitation.space.level}
                        createdDate={invitation.invitation.createdDate}
                        author={{ displayName: invitation.userDisplayName }}
                        type={invitation.invitation.contributorType}
                      />
                    </Caption>
                    {invitation.invitation.welcomeMessage && <Text>{invitation.invitation.welcomeMessage}</Text>}
                    {communityGuidelines && (
                      <>
                        <BlockSectionTitle paddingTop={gutters()}>
                          {communityGuidelines.profile.displayName}
                        </BlockSectionTitle>
                        <Gutters disablePadding>
                          <Box sx={{ wordWrap: 'break-word' }}>
                            <WrapperMarkdown disableParagraphPadding>
                              {communityGuidelines?.profile.description ?? ''}
                            </WrapperMarkdown>
                          </Box>
                          <References compact references={communityGuidelines?.profile.references} />
                        </Gutters>
                      </>
                    )}
                  </Gutters>
                </Gutters>
                <Actions>
                  {actions}
                  <FlexSpacer />
                  <Button
                    startIcon={<CloseOutlinedIcon />}
                    onClick={() => rejectInvitation(invitation.invitation.id)}
                    variant="outlined"
                    loading={rejecting}
                    disabled={updating && !rejecting}
                  >
                    {t('community.pendingMembership.invitationDialog.actions.reject')}
                  </Button>
                  <Button
                    startIcon={<CheckOutlined />}
                    onClick={() => acceptInvitation(invitation.invitation.id, invitation.space.about.profile.url)}
                    variant="contained"
                    loading={accepting}
                    disabled={updating && !accepting}
                  >
                    {getAcceptLabel(invitation)}
                  </Button>
                </Actions>
              </>
            )
          }
        </InvitationHydrator>
      )}
    </>
  );
};

export default SingleInvitationFull;
