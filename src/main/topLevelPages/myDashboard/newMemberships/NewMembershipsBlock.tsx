import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';
import { BlockSectionTitle, Caption, CaptionSmall } from '../../../../core/ui/typography';
import { gutters } from '../../../../core/ui/grid/utils';
import {
  ApplicationHydrator,
  InvitationHydrator,
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
import journeyIcon from '../../../../domain/shared/components/JourneyIcon/JourneyIcon';
import JourneyCardTagline from '../../../../domain/journey/common/JourneyCard/JourneyCardTagline';
import InvitationActionsContainer from '../../../../domain/community/invitations/InvitationActionsContainer';
import InvitationDialog from '../../../../domain/community/invitations/InvitationDialog';
import NewMembershipCard from './NewMembershipCard';
import SeeMore from '../../../../core/ui/content/SeeMore';
import { VisualType } from '../../../../core/apollo/generated/graphql-schema';
import BadgeCounter from '../../../../core/ui/icon/BadgeCounter';
import { Box } from '@mui/material';
import useNavigate from '../../../../core/routing/useNavigate';
import { JourneyLevel } from '../../../routing/resolvers/RouteResolver';

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
  halfWidth?: boolean;
  hiddenIfEmpty?: boolean;
  onOpenMemberships?: () => void;
}

const NewMembershipsBlock = ({
  halfWidth = false,
  hiddenIfEmpty = false,
  onOpenMemberships,
}: NewMembershipsBlockProps) => {
  const { t } = useTranslation();

  const navigate = useNavigate();

  const { data, refetch: refetchNewMembershipsQuery } = useNewMembershipsQuery();

  const invitations = useMemo(
    () =>
      data?.me.invitations.map(
        invitation =>
          ({
            type: PendingMembershipItemType.Invitation,
            ...invitation,
            spaceLevel: invitation.spaceLevel as JourneyLevel,
          } as const)
      ) ?? [],
    [data?.me.invitations]
  );

  const pendingInvitations = useMemo(
    () =>
      sortBy(
        invitations.filter(invitation => !RECENT_MEMBERSHIP_STATES.includes(invitation.state)),
        ({ createdDate }) => createdDate
      ).reverse(),
    [invitations]
  );

  const applications = useMemo(
    () =>
      data?.me.applications.map(
        application =>
          ({
            type: PendingMembershipItemType.Application,
            ...application,
            spaceLevel: application.spaceLevel as JourneyLevel,
          } as const)
      ) ?? [],
    [data?.me.applications]
  );

  const pendingApplications = useMemo(
    () =>
      sortBy(
        applications.filter(invitation => !RECENT_MEMBERSHIP_STATES.includes(invitation.state)),
        ({ createdDate }) => createdDate
      )
        .reverse()
        .slice(0, Math.max(0, PENDING_MEMBERSHIPS_MAX_ITEMS - pendingInvitations.length)),
    [applications]
  );
  const pendingMembershipsCount = pendingInvitations.length + pendingApplications.length;

  const recentMemberships = useMemo(
    () =>
      sortBy(
        [...invitations, ...applications].filter(({ state }) => RECENT_MEMBERSHIP_STATES.includes(state)),
        ({ createdDate }) => createdDate
      )
        .reverse()
        .slice(0, Math.max(0, PENDING_MEMBERSHIPS_MAX_ITEMS - pendingMembershipsCount - 1)),
    [invitations, applications]
  );

  const mySpaces = data?.me.mySpaces ?? [];

  const [openDialog, setOpenDialog] = useState<PendingMembershipsListDialogDetails | InvitationViewDialogDetails>();

  const closeDialog = () => setOpenDialog(undefined);

  const handleInvitationCardClick = ({ id, journeyUri }, from: InvitationViewDialogDetails['from']) => {
    setOpenDialog({
      type: DialogType.InvitationView,
      invitationId: id,
      from,
      journeyUri,
    });
  };

  const currentInvitation =
    openDialog?.type === DialogType.InvitationView
      ? invitations?.find(invitation => invitation.id === openDialog.invitationId)
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
      <PageContentBlock halfWidth={halfWidth} disableGap flex>
        <PageContentBlockHeader title={t('pages.home.sections.newMemberships.title')} />
        {pendingInvitations.length === 0 && pendingApplications.length === 0 && (
          <CaptionSmall color={theme => theme.palette.neutral.light} marginBottom={gutters(0.5)}>
            {t('pages.home.sections.newMemberships.noOpenInvitations')}
          </CaptionSmall>
        )}
        {pendingInvitations.length > 0 && (
          <>
            <Caption>
              {t('pages.home.sections.newMemberships.openInvitations')}
              <BadgeCounter count={pendingInvitations.length} size="small" />
            </Caption>
            <Box marginX={-1}>
              {pendingInvitations.slice(0, PENDING_MEMBERSHIPS_MAX_ITEMS).map(pendingInvitation => (
                <InvitationHydrator
                  key={pendingInvitation.id}
                  invitation={pendingInvitation}
                  withJourneyDetails
                  visualType={VisualType.Avatar}
                >
                  {({ invitation }) => (
                    <NewMembershipCard
                      membership={invitation}
                      onClick={() => invitation && handleInvitationCardClick(invitation, 'card')}
                      membershipType="invitation"
                    />
                  )}
                </InvitationHydrator>
              ))}
            </Box>
          </>
        )}
        {pendingApplications.length > 0 && (
          <>
            <Caption>{t('pages.home.sections.newMemberships.openApplications')}</Caption>
            <Box marginX={-1}>
              {pendingApplications.map(pendingApplication => (
                <ApplicationHydrator
                  key={pendingApplication.id}
                  application={pendingApplication}
                  visualType={VisualType.Avatar}
                >
                  {({ application: hydratedApplication }) => (
                    <NewMembershipCard
                      membership={hydratedApplication}
                      to={hydratedApplication?.journeyUri ?? ''}
                      membershipType="application"
                    />
                  )}
                </ApplicationHydrator>
              ))}
            </Box>
          </>
        )}
        {mySpaces.length > 0 && (
          <>
            <Caption>{t('pages.home.sections.newMemberships.mySpaces')}</Caption>
            {mySpaces.map(item => (
              <ApplicationHydrator
                key={item.space.spaceID}
                application={{
                  ...mapApiDataToContributionItem(item.space),
                }}
                visualType={VisualType.Avatar}
              >
                {({ application: hydratedApplication }) => (
                  <NewMembershipCard
                    membership={hydratedApplication}
                    to={hydratedApplication?.journeyUri}
                    membershipType="membership"
                  />
                )}
              </ApplicationHydrator>
            ))}
          </>
        )}
        {recentMemberships.length > 0 && (
          <>
            <Caption>{t('pages.home.sections.newMemberships.recentlyJoined')}</Caption>
            {recentMemberships.map(membership => {
              switch (membership.type) {
                case PendingMembershipItemType.Invitation:
                  return (
                    <InvitationHydrator
                      key={membership.id}
                      invitation={membership}
                      withJourneyDetails
                      visualType={VisualType.Avatar}
                    >
                      {({ invitation }) => (
                        <NewMembershipCard
                          membership={invitation}
                          to={invitation?.journeyUri}
                          membershipType="membership"
                        />
                      )}
                    </InvitationHydrator>
                  );
                case PendingMembershipItemType.Application:
                  return (
                    <ApplicationHydrator key={membership.id} application={membership} visualType={VisualType.Avatar}>
                      {({ application: hydratedApplication }) => (
                        <NewMembershipCard
                          membership={hydratedApplication}
                          to={hydratedApplication?.journeyUri}
                          membershipType="membership"
                        />
                      )}
                    </ApplicationHydrator>
                  );
                default:
                  return null;
              }
            })}
          </>
        )}
        {pendingMembershipsCount > 0 ? (
          <SeeMore
            sx={{ marginTop: gutters() }}
            label="pages.home.sections.newMemberships.seeMore"
            onClick={() => setOpenDialog({ type: DialogType.PendingMembershipsList })}
          />
        ) : (
          <SeeMore
            sx={{ marginTop: gutters() }}
            label="pages.home.sections.newMemberships.seeAll"
            onClick={() => onOpenMemberships?.()}
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
          {pendingInvitations && pendingInvitations.length > 0 && (
            <>
              <BlockSectionTitle>
                {t('community.pendingMembership.invitationsSectionTitle')}
                <BadgeCounter count={pendingInvitations.length} size="small" />
              </BlockSectionTitle>
              {pendingInvitations?.map(invitation => (
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
          {applications && applications.length > 0 && (
            <>
              <BlockSectionTitle>{t('community.pendingMembership.applicationsSectionTitle')}</BlockSectionTitle>
              <ScrollableCardsLayoutContainer>
                {applications?.map(application => (
                  <ApplicationHydrator key={application.id} application={application} visualType={VisualType.Card}>
                    {({ application: hydratedApplication }) =>
                      hydratedApplication && (
                        <JourneyCard
                          iconComponent={journeyIcon[hydratedApplication.journeyTypeName]}
                          header={hydratedApplication.journeyDisplayName}
                          tags={hydratedApplication.journeyTags ?? []}
                          banner={hydratedApplication.journeyVisual}
                          journeyUri={hydratedApplication.journeyUri}
                        >
                          <JourneyCardTagline>{hydratedApplication.journeyTagline ?? ''}</JourneyCardTagline>
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
