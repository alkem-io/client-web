import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';
import { BlockSectionTitle, CaptionSmall } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import {
  ApplicationHydrator,
  InvitationHydrator,
  InvitationWithMeta,
} from '../../../../domain/community/pendingMembership/PendingMemberships';
import InvitationCardHorizontal from '../../../../domain/community/invitations/InvitationCardHorizontal/InvitationCardHorizontal';
import React, { useMemo, useState } from 'react';
import { useNewMembershipsQuery } from '../../../../core/apollo/generated/apollo-hooks';
import { sortBy } from 'lodash';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import Gutters from '../../../../core/ui/grid/Gutters';
import { HdrStrongOutlined } from '@mui/icons-material';
import ScrollableCardsLayoutContainer from '../../../../core/ui/card/cardsLayout/ScrollableCardsLayoutContainer';
import JourneyCard from '../../../../domain/journey/common/JourneyCard/JourneyCard';
import spaceIcon from '../../../../domain/shared/components/JourneyIcon/JourneyIcon';
import JourneyCardTagline from '../../../../domain/journey/common/JourneyCard/JourneyCardTagline';
import InvitationActionsContainer from '../../../../domain/community/invitations/InvitationActionsContainer';
import InvitationDialog from '../../../../domain/community/invitations/InvitationDialog';
import NewMembershipCard from './NewMembershipCard';
import SeeMore from '../../../../core/ui/content/SeeMore';
import { CommunityContributorType, VisualType } from '../../../../core/apollo/generated/graphql-schema';
import BadgeCounter from '../../../../core/ui/icon/BadgeCounter';
import HorizontalCardsGroup from '../../../../core/ui/content/HorizontalCardsGroup';
import useNavigate from '../../../../core/routing/useNavigate';
import { PendingApplication } from '../../../../domain/community/user';
import { InvitationItem } from '../../../../domain/community/user/providers/UserProvider/InvitationItem';
import { getChildJourneyTypeName } from '../../../../domain/shared/utils/spaceLevel';

enum PendingMembershipItemType {
  Invitation,
  Application,
}

enum DialogType {
  PendingMembershipsList,
  InvitationView,
}

interface DialogDetails {
  type: DialogType;
}

interface PendingMembershipsListDialogDetails extends DialogDetails {
  type: DialogType.PendingMembershipsList;
  journeyUri?: string;
}

interface InvitationViewDialogDetails extends DialogDetails {
  type: DialogType.InvitationView;
  invitationId: string;
  from: 'dialog' | 'card';
  journeyUri?: string;
}

const PENDING_MEMBERSHIPS_MAX_ITEMS = 4;

const RECENT_MEMBERSHIP_STATES = ['approved', 'accepted'];

interface NewMembershipsBlockProps {
  hiddenIfEmpty?: boolean;
}

const NewMembershipsBlock = ({ hiddenIfEmpty = false }: NewMembershipsBlockProps) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { data, refetch: refetchNewMembershipsQuery } = useNewMembershipsQuery();

  const communityInvitations = useMemo(
    () =>
      data?.me.communityInvitations.map(
        invitation =>
          ({
            type: PendingMembershipItemType.Invitation,
            ...(invitation as InvitationItem),
          } as const)
      ) ?? [],
    [data?.me.communityInvitations]
  );

  const pendingCommunityInvitations = useMemo(
    () =>
      sortBy(
        communityInvitations.filter(({ invitation }) => !RECENT_MEMBERSHIP_STATES.includes(invitation.state ?? '')),
        ({ invitation }) => invitation.createdDate
      ).reverse(),
    [communityInvitations]
  );

  const communityApplications = useMemo(
    () =>
      data?.me.communityApplications.map(
        application =>
          ({
            type: PendingMembershipItemType.Application,
            ...(application as PendingApplication),
          } as const)
      ) ?? [],
    [data?.me.communityApplications]
  );

  const pendingCommunityApplications = communityApplications.filter(
    ({ application }) => !RECENT_MEMBERSHIP_STATES.includes(application.state ?? '')
  );

  const newestPendingApplications = useMemo(
    () =>
      sortBy(pendingCommunityApplications, ({ application }) => application.createdDate)
        .reverse()
        .slice(0, Math.max(0, PENDING_MEMBERSHIPS_MAX_ITEMS - pendingCommunityInvitations.length)),
    [communityApplications]
  );

  const pendingMembershipsCount = pendingCommunityInvitations.length + pendingCommunityApplications.length;

  const [openDialog, setOpenDialog] = useState<PendingMembershipsListDialogDetails | InvitationViewDialogDetails>();

  const closeDialog = () => setOpenDialog(undefined);

  const handleInvitationCardClick = (
    { id, space, invitation }: InvitationWithMeta,
    from: InvitationViewDialogDetails['from']
  ) => {
    setOpenDialog({
      type: DialogType.InvitationView,
      invitationId: id,
      from,
      journeyUri: invitation.contributorType === CommunityContributorType.Virtual ? undefined : space.profile.url,
    });
  };

  const currentInvitation =
    openDialog?.type === DialogType.InvitationView
      ? communityInvitations?.find(invitation => invitation.id === openDialog.invitationId)
      : undefined;

  const handleInvitationDialogClose = () => {
    setOpenDialog(openDialog => {
      return openDialog && 'from' in openDialog && openDialog.from === 'card'
        ? undefined
        : { type: DialogType.PendingMembershipsList };
    });
  };

  const onInvitationAccept = () => {
    refetchNewMembershipsQuery();

    if (openDialog?.journeyUri) {
      navigate(openDialog?.journeyUri);
    } else {
      setOpenDialog({ type: DialogType.PendingMembershipsList });
    }
  };

  const onInvitationReject = () => {
    refetchNewMembershipsQuery();
    setOpenDialog({ type: DialogType.PendingMembershipsList });
  };

  if (pendingMembershipsCount === 0 && hiddenIfEmpty) {
    return null;
  }

  return (
    <>
      <PageContentBlock columns={4} disableGap flex>
        <PageContentBlockHeader title={t('pages.home.sections.newMemberships.title')} />

        {pendingCommunityInvitations.length === 0 && newestPendingApplications.length === 0 && (
          <CaptionSmall color={theme => theme.palette.neutral.light} marginBottom={gutters(0.5)}>
            {t('pages.home.sections.newMemberships.noOpenInvitations')}
          </CaptionSmall>
        )}

        <HorizontalCardsGroup
          title={
            <>
              {t('pages.home.sections.newMemberships.openInvitations')}
              <BadgeCounter count={pendingCommunityInvitations.length} size="small" />
            </>
          }
        >
          {pendingCommunityInvitations.slice(0, PENDING_MEMBERSHIPS_MAX_ITEMS).map(pendingInvitation => (
            <InvitationHydrator
              key={pendingInvitation.id}
              invitation={pendingInvitation}
              withJourneyDetails
              visualType={VisualType.Avatar}
            >
              {({ invitation }) => (
                <NewMembershipCard
                  space={invitation?.space}
                  onClick={() => invitation && handleInvitationCardClick(invitation, 'card')}
                  membershipType="invitation"
                />
              )}
            </InvitationHydrator>
          ))}
        </HorizontalCardsGroup>

        <HorizontalCardsGroup title={t('pages.home.sections.newMemberships.openApplications')}>
          {newestPendingApplications.map(pendingApplication => (
            <ApplicationHydrator
              key={pendingApplication.id}
              application={pendingApplication as PendingApplication}
              visualType={VisualType.Avatar}
            >
              {({ application: hydratedApplication }) => (
                <NewMembershipCard
                  space={hydratedApplication?.space}
                  to={hydratedApplication?.space.profile.url}
                  membershipType="application"
                />
              )}
            </ApplicationHydrator>
          ))}
        </HorizontalCardsGroup>

        {pendingMembershipsCount > PENDING_MEMBERSHIPS_MAX_ITEMS && (
          <SeeMore
            sx={{ marginTop: gutters() }}
            label="pages.home.sections.newMemberships.seeMore"
            onClick={() => setOpenDialog({ type: DialogType.PendingMembershipsList })}
          />
        )}
      </PageContentBlock>
      <DialogWithGrid columns={12} open={openDialog?.type === DialogType.PendingMembershipsList} onClose={closeDialog}>
        <DialogHeader
          title={
            <Gutters row disablePadding>
              <HdrStrongOutlined fontSize="small" />
              {t('community.pendingMembership.pendingMemberships')}
            </Gutters>
          }
          onClose={closeDialog}
        />
        <Gutters paddingTop={0}>
          {pendingCommunityInvitations && pendingCommunityInvitations.length > 0 && (
            <>
              <BlockSectionTitle>
                {t('community.pendingMembership.invitationsSectionTitle')}
                <BadgeCounter count={pendingCommunityInvitations.length} size="small" />
              </BlockSectionTitle>
              {pendingCommunityInvitations?.map(invitation => (
                <InvitationHydrator key={invitation.id} invitation={invitation}>
                  {({ invitation }) => (
                    <InvitationCardHorizontal
                      invitation={invitation}
                      onClick={() => invitation && handleInvitationCardClick(invitation, 'dialog')}
                    />
                  )}
                </InvitationHydrator>
              ))}
            </>
          )}
          {pendingCommunityApplications && pendingCommunityApplications.length > 0 && (
            <>
              <BlockSectionTitle>{t('community.pendingMembership.applicationsSectionTitle')}</BlockSectionTitle>
              <ScrollableCardsLayoutContainer>
                {pendingCommunityApplications?.map(applicationItem => (
                  <ApplicationHydrator
                    key={applicationItem.id}
                    application={applicationItem}
                    visualType={VisualType.Card}
                  >
                    {({ application: hydratedApplication }) =>
                      hydratedApplication && (
                        <JourneyCard
                          iconComponent={spaceIcon[getChildJourneyTypeName(hydratedApplication.space)]}
                          header={hydratedApplication.space.profile.displayName}
                          tags={hydratedApplication.space.profile.tagset?.tags ?? []}
                          banner={hydratedApplication.space.profile.visual}
                          journeyUri={hydratedApplication.space.profile.url}
                        >
                          <JourneyCardTagline>{hydratedApplication.space.profile.tagline ?? ''}</JourneyCardTagline>
                        </JourneyCard>
                      )
                    }
                  </ApplicationHydrator>
                ))}
              </ScrollableCardsLayoutContainer>
            </>
          )}
        </Gutters>
      </DialogWithGrid>
      <InvitationActionsContainer onAccept={onInvitationAccept} onReject={onInvitationReject}>
        {props => (
          <InvitationDialog
            open={openDialog?.type === DialogType.InvitationView}
            onClose={handleInvitationDialogClose}
            invitation={currentInvitation}
            {...props}
          />
        )}
      </InvitationActionsContainer>
    </>
  );
};

export default NewMembershipsBlock;
