import { defer } from 'lodash-es';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ActorType, SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import {
  refetchV2PendingMembershipsQuery,
  useV2RespondToRequestMutation,
} from '@/core/apollo/generated-v2/apollo-hooks';
import { RoleName } from '@/core/apollo/generated-v2/legacy-vocabulary';
import useNavigate from '@/core/routing/useNavigate';
import { useNotification } from '@/core/ui/notifications/useNotification';
import { InvitationDetailDialog } from '@/crd/components/dashboard/InvitationDetailDialog';
import { OrgPendingApplicationCard } from '@/crd/components/dashboard/OrgPendingApplicationCard';
import { OrgPendingInvitationCard } from '@/crd/components/dashboard/OrgPendingInvitationCard';
import { PendingApplicationCard } from '@/crd/components/dashboard/PendingApplicationCard';
import { PendingInvitationCard } from '@/crd/components/dashboard/PendingInvitationCard';
import { PendingMembershipsListDialog } from '@/crd/components/dashboard/PendingMembershipsListDialog';
import { PendingMembershipsSection } from '@/crd/components/dashboard/PendingMembershipsSection';
import { OrgInvitationDetailDialog } from '@/crd/components/organization/OrgInvitationDetailDialog';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { InvitationEvent } from '@/domain/community/invitations/InvitationApplicationConstants';
import useInvitationActions from '@/domain/community/invitations/useInvitationActions';
import {
  type PendingMembershipRequest,
  usePendingMemberships,
} from '@/domain/community/pendingMembership/PendingMemberships';
import {
  PendingMembershipsDialogType,
  usePendingMembershipsDialog,
} from '@/domain/community/pendingMembership/PendingMembershipsDialogContext';
import DetailedActivityDescription from '@/domain/shared/components/ActivityDescription/DetailedActivityDescription';
import {
  mapOrgApplicationToCardData,
  mapOrgInvitationToCardData,
  mapPendingApplicationToCardData,
  mapPendingInvitationToCardData,
  mapPendingInvitationToDetailData,
  offeredOrganizationRoleKey,
  requestOrganization,
  requestSpace,
} from './pendingMembershipsDataMappers';

// ─── Pure helpers (exported for unit testing — T014) ───────────────────────

/**
 * Neither VC nor organization invitations navigate to the space on accept —
 * VCs aren't a space the current user visits, and an org invitation is acted
 * on by an org admin who isn't necessarily joining the space themselves (R4).
 * Both return to the pending-memberships list instead (`onInvitationAccept`
 * falls through to `setOpenDialog({ type: PendingMembershipsList })` whenever
 * `openDialog.spaceUri` is undefined). `actorType` is the invited actor's (MembershipRequest.actor).
 */
export const resolveInvitationSpaceUri = (
  actorType: string | undefined,
  spaceUrl: string | null | undefined
): string | undefined => {
  const returnsToList = actorType === 'virtual_contributor' || actorType === 'organization';
  return returnsToList ? undefined : (spaceUrl ?? undefined);
};

/** Splits the flat invitation list into the three sections the list dialog renders, by the invited actor's type. */
export const classifyInvitations = <T extends { actor?: { actorType: string } | null }>(
  invitations: T[] | undefined
): {
  userInvitations: T[] | undefined;
  organizationInvitations: T[] | undefined;
  virtualContributorInvitations: T[] | undefined;
} => ({
  userInvitations: invitations?.filter(
    inv => inv.actor?.actorType !== 'virtual_contributor' && inv.actor?.actorType !== 'organization'
  ),
  organizationInvitations: invitations?.filter(inv => inv.actor?.actorType === 'organization'),
  virtualContributorInvitations: invitations?.filter(inv => inv.actor?.actorType === 'virtual_contributor'),
});

/** The presentation enums the shared activity description is keyed on. */
const LEGACY_ACTOR_TYPE: Record<string, ActorType> = {
  user: ActorType.User,
  organization: ActorType.Organization,
  virtual_contributor: ActorType.VirtualContributor,
};
const LEGACY_SPACE_LEVEL = [SpaceLevel.L0, SpaceLevel.L1, SpaceLevel.L2];

// ─── Per-item cards ─────────────────────────────────────────────────────────

const PendingInvitationListItem = ({
  invitation,
  onClick,
}: {
  invitation: PendingMembershipRequest;
  onClick: (inv: PendingMembershipRequest) => void;
}) => {
  const { t } = useTranslation();
  return (
    <li>
      <PendingInvitationCard
        invitation={mapPendingInvitationToCardData(invitation, t)}
        onClick={() => onClick(invitation)}
      />
    </li>
  );
};

const PendingApplicationListItem = ({
  application,
  onClick,
}: {
  application: PendingMembershipRequest;
  onClick: (url: string) => void;
}) => {
  const cardData = mapPendingApplicationToCardData(application);
  return (
    <li>
      <PendingApplicationCard application={cardData} onClick={() => onClick(cardData.spaceHref)} />
    </li>
  );
};

// ─── Organization invitation response ───────────────────────────────────────

/** The withheld notice names the single elevated role that could not be granted (RS-D01: actual withholding). */
const withheldRoleKey = (roles: readonly string[]): 'admin' | 'owner' | undefined => {
  if (roles.includes(RoleName.Admin)) return 'admin';
  if (roles.includes(RoleName.Owner)) return 'owner';
  return undefined;
};

/**
 * Accept / decline the viewer's own organization invitation through Mutation.respondToRequest (screens-dispositions.tsv
 * :17683), reporting the roles the acceptance withheld (MembershipRequest.withheldRoles, H-community-roles-3) exactly
 * as the organization profile's response does: an inline notice for that invitation plus a warning, and an error toast
 * on failure.
 */
const useOrgInvitationRespond = (onSettled: () => void, currentInvitationId: string | undefined) => {
  const { t } = useTranslation('crd-profilePages');
  const notify = useNotification();
  const [respondToRequest, { loading }] = useV2RespondToRequestMutation();
  const [pendingAction, setPendingAction] = useState<'accept' | 'decline' | null>(null);
  const [withheldNotice, setWithheldNotice] = useState<{ invitationId: string; message: string }>();

  const respond = async (invitationId: string, event: InvitationEvent, action: 'accept' | 'decline') => {
    setPendingAction(action);
    setWithheldNotice(undefined);
    try {
      const result = await respondToRequest({
        variables: { id: invitationId, event },
        refetchQueries: [refetchV2PendingMembershipsQuery()],
        awaitRefetchQueries: true,
      });
      const withheldRole = withheldRoleKey(
        result.data?.respondToRequest.request?.withheldRoles.map(withheld => withheld.role) ?? []
      );
      if (action === 'accept' && withheldRole) {
        const message = t('orgProfile.invitationDialog.withheld', {
          role: t(`orgProfile.invitationDialog.roleName.${withheldRole}`),
        });
        setWithheldNotice({ invitationId, message });
        notify(message, 'warning');
      }
      onSettled();
    } catch {
      notify(
        action === 'accept'
          ? t('orgProfile.invitationDialog.acceptError')
          : t('orgProfile.invitationDialog.declineError'),
        'error'
      );
    } finally {
      setPendingAction(null);
    }
  };

  return {
    onAccept: (invitationId: string) => respond(invitationId, InvitationEvent.ACCEPT, 'accept'),
    onDecline: (invitationId: string) => respond(invitationId, InvitationEvent.REJECT, 'decline'),
    accepting: loading && pendingAction === 'accept',
    declining: loading && pendingAction === 'decline',
    withheldNotice:
      withheldNotice && (currentInvitationId === undefined || withheldNotice.invitationId === currentInvitationId)
        ? withheldNotice.message
        : undefined,
    clearWithheldNotice: () => setWithheldNotice(undefined),
  };
};

// ─── Invitation Detail Container ────────────────────────────────────────────

const InvitationDetailContainer = ({
  open,
  currentInvitation,
  onAccept,
  onReject,
  onClose,
  onBack,
}: {
  open: boolean;
  currentInvitation: PendingMembershipRequest | undefined;
  onAccept: () => void;
  onReject: () => void;
  onClose: () => void;
  onBack: () => void;
}) => {
  const { t } = useTranslation('crd-dashboard');
  const { t: tMain, i18n } = useTranslation();

  const props = useInvitationActions({
    onAccept: () => onAccept(),
    onReject: () => onReject(),
  });

  if (!currentInvitation) {
    return null;
  }

  const space = requestSpace(currentInvitation);
  const actorType = currentInvitation.actor?.actorType;
  const isVC = actorType === 'virtual_contributor';
  const isOrg = actorType === 'organization';

  const title = isOrg
    ? t('pendingMemberships.orgInvitationDialog.title', {
        organizationName: currentInvitation.actor?.about?.displayName ?? '',
      })
    : isVC
      ? tMain('community.pendingMembership.invitationDialog.vc.title', {
          space: space.about.displayName,
        })
      : tMain('community.pendingMembership.invitationDialog.title', {
          space: space.about.displayName,
        });

  const acceptLabel = isVC || isOrg ? t('pendingMemberships.detail.accept') : t('pendingMemberships.detail.join');
  const rejectLabel = t('pendingMemberships.detail.reject');

  const detailData = mapPendingInvitationToDetailData(currentInvitation, i18n.language);

  // The offered role + every Space the organization joins on accept (D7; MembershipRequest.wouldJoin, RS-D03) —
  // organization invitations only; the generic activity description above already covers user/VC invites.
  const roleText = currentInvitation.roles.includes(RoleName.Lead)
    ? `${tMain('member')} + ${tMain('lead')}`
    : tMain('member');
  const spacesToJoin = currentInvitation.wouldJoin ?? [];

  const descriptionSlot = (
    <div className="text-caption text-muted-foreground">
      <DetailedActivityDescription
        i18nKey="community.pendingMembership.invitationCardTitle"
        spaceDisplayName={space.about.displayName}
        spaceUrl={detailData.spaceHref}
        spaceLevel={LEGACY_SPACE_LEVEL[space.depth]}
        createdDate={currentInvitation.createdAt}
        author={{ displayName: currentInvitation.createdBy?.about?.displayName }}
        type={actorType ? LEGACY_ACTOR_TYPE[actorType] : undefined}
      />
      {isOrg && (
        <p className="mt-1">
          {t('pendingMemberships.orgInvitationDialog.role')}: {roleText}
          {spacesToJoin.length > 1 &&
            ` · ${t('pendingMemberships.orgInvitationDialog.spacesToJoin', {
              spaces: spacesToJoin.map(joining => joining.displayName).join(', '),
            })}`}
        </p>
      )}
    </div>
  );

  const welcomeMessageSlot = currentInvitation.message ? (
    <p className="text-body">{currentInvitation.message}</p>
  ) : undefined;

  return (
    <InvitationDetailDialog
      open={open}
      onClose={onClose}
      onBack={onBack}
      invitation={detailData}
      title={title}
      acceptLabel={acceptLabel}
      rejectLabel={rejectLabel}
      descriptionSlot={descriptionSlot}
      welcomeMessageSlot={welcomeMessageSlot}
      onAccept={() => props.acceptInvitation(currentInvitation.id, detailData.spaceHref)}
      accepting={props.accepting}
      onReject={() => props.rejectInvitation(currentInvitation.id)}
      rejecting={props.rejecting}
      updating={props.updating}
    />
  );
};

// ─── Main Dialog ────────────────────────────────────────────────────────────

const CrdPendingMembershipsDialog = () => {
  const { t } = useTranslation('crd-dashboard');
  const navigate = useNavigate();
  // `TFunction<'crd-dashboard'>`'s literal-key overload set (grown further by this
  // feature's own new keys) pushes TypeScript's generic instantiation past its depth
  // limit when passed into a plainly-typed helper parameter; widen once here rather
  // than fight the compiler at every call site below.
  const orgCardTranslator = t as (key: string, options?: Record<string, unknown>) => string;
  // The org cards' relative-time label comes from `common.time.short.*`, which lives in
  // `crd-common` only, so it needs the default-namespace translator rather than `t`.
  const { t: tCommon } = useTranslation();
  const commonTranslator = tCommon as (key: string, options?: Record<string, unknown>) => string;
  const { openDialog, setOpenDialog } = usePendingMembershipsDialog();

  const closeDialog = () => setOpenDialog(undefined);

  const isDialogOpen = Object.values(PendingMembershipsDialogType).includes(openDialog?.type ?? '');
  const isPendingMembershipsList = openDialog?.type === PendingMembershipsDialogType.PendingMembershipsList;

  const { invitations, applications, orgInvitations, orgApplications, loading, refetch } = usePendingMemberships({
    skip: !isDialogOpen,
  });

  useEffect(() => {
    if (isPendingMembershipsList) {
      refetch();
    }
  }, [isPendingMembershipsList, refetch]);

  // Organization invitations (062) — their own dialog, not the Space InvitationDetailContainer
  // below (which hydrates a Space and has no organization-shaped equivalent).
  const [viewingOrgInvitationId, setViewingOrgInvitationId] = useState<string | null>(null);
  const viewingOrgInvitation = orgInvitations?.find(inv => inv.id === viewingOrgInvitationId);
  const orgInvitationResponse = useOrgInvitationRespond(() => {
    setViewingOrgInvitationId(null);
  }, viewingOrgInvitation?.id);
  const viewingOrganization = viewingOrgInvitation ? requestOrganization(viewingOrgInvitation) : undefined;

  const handleInvitationCardClick = (invitation: PendingMembershipRequest) => {
    setOpenDialog({
      type: PendingMembershipsDialogType.InvitationView,
      invitationId: invitation.id,
      spaceUri: resolveInvitationSpaceUri(invitation.actor?.actorType, requestSpace(invitation).url),
    });
  };

  const handleSpaceCardClick = (spaceUrl: string) => {
    closeDialog();
    navigate(spaceUrl);
  };

  const currentInvitation =
    openDialog?.type === PendingMembershipsDialogType.InvitationView
      ? invitations?.find(inv => inv.id === openDialog.invitationId)
      : undefined;

  const { userInvitations, organizationInvitations, virtualContributorInvitations } = classifyInvitations(invitations);

  const isEmpty =
    !userInvitations?.length &&
    !organizationInvitations?.length &&
    !virtualContributorInvitations?.length &&
    !applications?.length &&
    !orgInvitations?.length &&
    !orgApplications?.length;

  const onInvitationAccept = () => {
    if (openDialog?.spaceUri) {
      navigate(openDialog.spaceUri);
      defer(closeDialog);
    } else {
      setOpenDialog({ type: PendingMembershipsDialogType.PendingMembershipsList });
    }
  };

  const onInvitationReject = () => {
    setOpenDialog({ type: PendingMembershipsDialogType.PendingMembershipsList });
  };

  return (
    <>
      <PendingMembershipsListDialog
        // Hidden while an organization invitation is being viewed so the two
        // dialogs never stack (the Space path swaps `openDialog.type` instead);
        // closing the detail dialog brings the list back.
        open={isPendingMembershipsList && viewingOrgInvitationId === null}
        onClose={closeDialog}
        loading={loading}
        empty={isEmpty}
      >
        {userInvitations?.length ? (
          <PendingMembershipsSection title={t('pendingMemberships.invitationsSection')}>
            {userInvitations.map(inv => (
              <PendingInvitationListItem key={inv.id} invitation={inv} onClick={handleInvitationCardClick} />
            ))}
          </PendingMembershipsSection>
        ) : null}

        {organizationInvitations?.length ? (
          <PendingMembershipsSection title={t('pendingMemberships.orgInvitationsSection')}>
            {organizationInvitations.map(inv => (
              <PendingInvitationListItem key={inv.id} invitation={inv} onClick={handleInvitationCardClick} />
            ))}
          </PendingMembershipsSection>
        ) : null}

        {virtualContributorInvitations?.length ? (
          <PendingMembershipsSection title={t('pendingMemberships.vcInvitationsSection')}>
            {virtualContributorInvitations.map(inv => (
              <PendingInvitationListItem key={inv.id} invitation={inv} onClick={handleInvitationCardClick} />
            ))}
          </PendingMembershipsSection>
        ) : null}

        {applications?.length ? (
          <PendingMembershipsSection title={t('pendingMemberships.applicationsSection')}>
            {applications.map(app => (
              <PendingApplicationListItem key={app.id} application={app} onClick={handleSpaceCardClick} />
            ))}
          </PendingMembershipsSection>
        ) : null}

        {orgInvitations?.length ? (
          <PendingMembershipsSection title={t('pendingMemberships.orgAssociateInvitationsSection')}>
            {orgInvitations.map(inv => (
              <OrgPendingInvitationCard
                key={inv.id}
                invitation={mapOrgInvitationToCardData(inv, orgCardTranslator, commonTranslator)}
                onClick={() => setViewingOrgInvitationId(inv.id)}
              />
            ))}
          </PendingMembershipsSection>
        ) : null}

        {orgApplications?.length ? (
          <PendingMembershipsSection title={t('pendingMemberships.orgAssociateApplicationsSection')}>
            {orgApplications.map(app => (
              <OrgPendingApplicationCard
                key={app.id}
                application={mapOrgApplicationToCardData(app)}
                onClick={() => {
                  const href = requestOrganization(app).url;
                  if (href) handleSpaceCardClick(href);
                }}
              />
            ))}
          </PendingMembershipsSection>
        ) : null}
      </PendingMembershipsListDialog>

      <InvitationDetailContainer
        open={openDialog?.type === PendingMembershipsDialogType.InvitationView}
        currentInvitation={currentInvitation}
        onAccept={onInvitationAccept}
        onReject={onInvitationReject}
        onClose={closeDialog}
        onBack={() => setOpenDialog({ type: PendingMembershipsDialogType.PendingMembershipsList })}
      />

      {viewingOrgInvitation && viewingOrganization && (
        <OrgInvitationDetailDialog
          open={viewingOrgInvitationId !== null}
          onOpenChange={open => {
            if (!open) {
              setViewingOrgInvitationId(null);
              orgInvitationResponse.clearWithheldNotice();
            }
          }}
          organizationName={viewingOrganization.about.displayName}
          organizationAvatarUrl={viewingOrganization.about.avatar?.file.url}
          organizationColor={pickColorFromId(viewingOrganization.id)}
          offeredRoleLabel={t(
            `pendingMemberships.orgAssociateCard.role.${offeredOrganizationRoleKey(viewingOrgInvitation.roles)}`
          )}
          invitedByLabel={
            viewingOrgInvitation.createdBy?.about?.displayName
              ? t('pendingMemberships.orgAssociateCard.invitedBy', {
                  name: viewingOrgInvitation.createdBy.about.displayName,
                })
              : undefined
          }
          message={viewingOrgInvitation.message ?? undefined}
          onAccept={() => orgInvitationResponse.onAccept(viewingOrgInvitation.id)}
          onDecline={() => orgInvitationResponse.onDecline(viewingOrgInvitation.id)}
          accepting={orgInvitationResponse.accepting}
          declining={orgInvitationResponse.declining}
          withheldNotice={orgInvitationResponse.withheldNotice}
        />
      )}
    </>
  );
};

export default CrdPendingMembershipsDialog;
