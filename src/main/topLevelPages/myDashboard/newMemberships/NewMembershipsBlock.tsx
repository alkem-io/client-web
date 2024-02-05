import PageContentBlock from '../../../../core/ui/content/PageContentBlock';
import PageContentBlockHeader from '../../../../core/ui/content/PageContentBlockHeader';
import { useTranslation } from 'react-i18next';
import { BlockSectionTitle, Caption } from '../../../../core/ui/typography';
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
import { Identifiable } from '../../../../core/utils/Identifiable';
import { ContributionItem } from '../../../../domain/community/user/contribution';
import NewMembershipCard from './NewMembershipCard';
import SeeMore from '../../../../core/ui/content/SeeMore';
import { VisualType } from '../../../../core/apollo/generated/graphql-schema';
import BadgeCounter from '../../../../core/ui/icon/BadgeCounter';

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
}

interface InvitationViewDialogDetails extends DialogDetails {
  type: DialogType.InvitationView;
  invitationId: string;
  from: 'dialog' | 'card';
}

const PENDING_MEMBERSHIPS_MAX_ITEMS = 4;

interface JourneyLocationApiData {
  spaceID: string;
  challengeID?: string;
  opportunityID?: string;
}

export const mapApiDataToContributionItem = <Incoming extends JourneyLocationApiData & Identifiable>({
  spaceID,
  challengeID,
  opportunityID,
  ...apiData
}: Incoming): Omit<Incoming, keyof JourneyLocationApiData> & ContributionItem => {
  return {
    ...apiData,
    spaceId: spaceID,
    challengeId: challengeID,
    opportunityId: opportunityID,
  };
};

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

  const { data, refetch: refetchNewMembershipsQuery } = useNewMembershipsQuery();

  const invitations = useMemo(
    () =>
      data?.me.invitations.map(
        invitation =>
          ({
            type: PendingMembershipItemType.Invitation,
            ...invitation,
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

  const [openDialog, setOpenDialog] = useState<PendingMembershipsListDialogDetails | InvitationViewDialogDetails>();

  const closeDialog = () => setOpenDialog(undefined);

  const handleInvitationCardClick = ({ id }: Identifiable, from: InvitationViewDialogDetails['from']) => {
    setOpenDialog({
      type: DialogType.InvitationView,
      invitationId: id,
      from,
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

  const handleClickSeeMore = () => {
    if (recentMemberships.length > 0) {
      onOpenMemberships?.();
    } else {
      setOpenDialog({ type: DialogType.PendingMembershipsList });
    }
  };

  if (pendingMembershipsCount === 0 && hiddenIfEmpty) {
    return null;
  }

  return (
    <>
      <PageContentBlock halfWidth={halfWidth}>
        <PageContentBlockHeader title={t('pages.home.sections.newMemberships.title')} />
        {pendingInvitations.length > 0 && (
          <>
            <Caption marginTop={gutters(-1)}>
              {t('pages.home.sections.newMemberships.openInvitations')}
              <BadgeCounter count={pendingInvitations.length} size="small" />
            </Caption>
            <Gutters disablePadding>
              {pendingInvitations.slice(0, PENDING_MEMBERSHIPS_MAX_ITEMS).map(pendingInvitation => (
                <InvitationHydrator
                  key={pendingInvitation.id}
                  invitation={mapApiDataToContributionItem(pendingInvitation)}
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
            </Gutters>
          </>
        )}
        {pendingApplications.length > 0 && (
          <>
            <Caption marginTop={pendingInvitations.length === 0 ? gutters(-1) : undefined}>
              {t('pages.home.sections.newMemberships.openApplications')}
            </Caption>
            <Gutters disablePadding>
              {pendingApplications.map(pendingApplication => (
                <ApplicationHydrator
                  key={pendingApplication.id}
                  application={mapApiDataToContributionItem(pendingApplication)}
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
            </Gutters>
          </>
        )}
        {recentMemberships.length > 0 && (
          <>
            <Caption>{t('pages.home.sections.newMemberships.recentlyJoined')}</Caption>
            <Gutters disablePadding>
              {recentMemberships.map(membership => {
                switch (membership.type) {
                  case PendingMembershipItemType.Invitation:
                    return (
                      <InvitationHydrator
                        key={membership.id}
                        invitation={mapApiDataToContributionItem(membership)}
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
                      <ApplicationHydrator
                        key={membership.id}
                        application={mapApiDataToContributionItem(membership)}
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
                    );
                  default:
                    return null;
                }
              })}
            </Gutters>
          </>
        )}
        <SeeMore label="pages.home.sections.newMemberships.seeMore" onClick={handleClickSeeMore} />
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
                <InvitationHydrator key={invitation.id} invitation={mapApiDataToContributionItem(invitation)}>
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
                  <ApplicationHydrator
                    key={application.id}
                    application={mapApiDataToContributionItem(application)}
                    visualType={VisualType.Card}
                  >
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
      <InvitationActionsContainer
        onUpdate={() => {
          setOpenDialog({ type: DialogType.PendingMembershipsList });
          refetchNewMembershipsQuery();
        }}
      >
        {props => (
          <InvitationDialog
            open={openDialog?.type === DialogType.InvitationView}
            onClose={handleInvitationDialogClose}
            invitation={currentInvitation && mapApiDataToContributionItem(currentInvitation)}
            {...props}
          />
        )}
      </InvitationActionsContainer>
    </>
  );
};

export default NewMembershipsBlock;
