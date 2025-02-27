import { ReactNode } from 'react';
import { InvitationHydrator, InvitationWithMeta } from '../pendingMembership/PendingMemberships';
import Gutters from '@/core/ui/grid/Gutters';
import { CheckOutlined, HdrStrongOutlined } from '@mui/icons-material';
import JourneyCard from '@/domain/journey/common/JourneyCard/JourneyCard';
import JourneyCardTagline from '@/domain/journey/common/JourneyCard/JourneyCardTagline';
import { BlockSectionTitle, Caption, Text } from '@/core/ui/typography';
import DetailedActivityDescription from '@/domain/shared/components/ActivityDescription/DetailedActivityDescription';
import { LoadingButton } from '@mui/lab';
import CloseOutlinedIcon from '@mui/icons-material/CloseOutlined';
import { InvitationItem } from '../user/providers/UserProvider/InvitationItem';
import { useTranslation } from 'react-i18next';
import { RoleSetContributorType } from '@/core/apollo/generated/graphql-schema';
import { Box, Theme, useMediaQuery } from '@mui/material';
import WrapperMarkdown from '@/core/ui/markdown/WrapperMarkdown';
import References from '@/domain/shared/components/References/References';
import { gutters } from '@/core/ui/grid/utils';
import FlexSpacer from '@/core/ui/utils/FlexSpacer';
import { Actions } from '@/core/ui/actions/Actions';
import { spaceIconByLevel } from '@/domain/shared/components/SpaceIcon/SpaceIcon';

type SingleInvitationFullProps = {
  invitation: InvitationItem | undefined;
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

  const isMobile = useMediaQuery<Theme>(theme => theme.breakpoints.down('sm'));

  const getTitle = (invitation: InvitationWithMeta) => {
    if (invitation.invitation.contributorType === RoleSetContributorType.Virtual) {
      return t('community.pendingMembership.invitationDialog.vc.title', {
        journey: invitation?.space.about.profile.displayName,
      });
    }

    return t('community.pendingMembership.invitationDialog.title', {
      journey: invitation?.space.about.profile.displayName,
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
                  flexDirection={isMobile ? 'column' : 'row'}
                  alignItems={isMobile ? 'center' : 'start'}
                >
                  <JourneyCard
                    iconComponent={spaceIconByLevel[invitation.space.level]}
                    header={invitation.space.about.profile.displayName}
                    tags={invitation.space.about.profile.tagset?.tags ?? []}
                    banner={invitation.space.about.profile.cardBanner}
                    journeyUri={invitation.space.about.profile.url}
                  >
                    <JourneyCardTagline>{invitation.space.about.profile.tagline ?? ''}</JourneyCardTagline>
                  </JourneyCard>
                  <Gutters disablePadding>
                    <Caption>
                      <DetailedActivityDescription
                        i18nKey="community.pendingMembership.invitationTitle"
                        journeyDisplayName={invitation.space.about.profile.displayName}
                        journeyUrl={invitation.space.about.profile.url}
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
                  <LoadingButton
                    startIcon={<CloseOutlinedIcon />}
                    onClick={() => rejectInvitation(invitation.invitation.id)}
                    variant="outlined"
                    loading={rejecting}
                    disabled={updating && !rejecting}
                  >
                    {t('community.pendingMembership.invitationDialog.actions.reject')}
                  </LoadingButton>
                  <LoadingButton
                    startIcon={<CheckOutlined />}
                    onClick={() => acceptInvitation(invitation.invitation.id, invitation.space.about.profile.url)}
                    variant="contained"
                    loading={accepting}
                    disabled={updating && !accepting}
                  >
                    {getAcceptLabel(invitation)}
                  </LoadingButton>
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
