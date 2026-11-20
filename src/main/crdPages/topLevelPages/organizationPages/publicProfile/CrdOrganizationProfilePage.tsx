import { Building2 } from 'lucide-react';
import { useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { OrganizationVerificationEnum } from '@/core/apollo/generated/graphql-schema';
import useNavigate from '@/core/routing/useNavigate';
import { usePageTitle } from '@/core/routing/usePageTitle';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';
import type { ProfileResourceTab } from '@/crd/components/common/ProfileResourceTabStrip';
import { OrganizationAssociateAction } from '@/crd/components/organization/OrganizationAssociateAction';
import { OrganizationPublicProfileView } from '@/crd/components/organization/OrganizationPublicProfileView';
import { OrgInvitationDetailDialog } from '@/crd/components/organization/OrgInvitationDetailDialog';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { RoleType } from '@/domain/community/user/constants/RoleType';
import useFilteredMemberships from '@/domain/community/user/hooks/useFilteredMemberships';
import { MetricType } from '@/domain/platform/metrics/MetricType';
import getMetricCount from '@/domain/platform/metrics/utils/getMetricCount';
import { CrdNotFoundView } from '@/main/crdPages/error/CrdNotFoundView';
import { MembershipCardConnector } from '@/main/crdPages/topLevelPages/common/MembershipCardConnector';
import {
  buildTagsetGroups,
  mapAccountHostedResources,
  normaliseReferences,
} from '@/main/crdPages/topLevelPages/common/profileMapperHelpers';
import useResourceTabs from '@/main/crdPages/topLevelPages/common/useResourceTabs';
import { useSendMessageToOrganizationHandler } from '@/main/crdPages/topLevelPages/common/useSendMessageHandler';
import { buildLoginUrl, buildSignUpUrl } from '@/main/routing/urlBuilders';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { OrgApplyDialogConnector } from './OrgApplyDialogConnector';
import { mapAssociates, offeredRoleLabelKey, orgSettingsHref } from './organizationProfileMapper';
import { useCrdOrganizationProfilePageData } from './useCrdOrganizationProfilePageData';
import { useOrganizationAssociateAction } from './useOrganizationAssociateAction';
import { useOrgInvitationResponse } from './useOrgInvitationResponse';

type OrganizationGuestResourcesNoticeProps = {
  organizationName: string;
  signUpHref: string;
};

/**
 * The organization display name is controlled by its admins, and interpolation
 * escaping is off globally, so without per-call escaping any markup in the name
 * would be parsed as Trans component tags. Escaping the value and unescaping the
 * resulting text nodes renders the name strictly as literal text.
 */
export const OrganizationGuestResourcesNotice = ({
  organizationName,
  signUpHref,
}: OrganizationGuestResourcesNoticeProps) => {
  const { t } = useTranslation('crd-profilePages');
  return (
    <p className="text-body text-muted-foreground mb-4">
      <Trans
        t={t}
        i18nKey="orgProfile.guestResourcesNotice"
        values={{ organization: organizationName }}
        tOptions={{ interpolation: { escapeValue: true } }}
        shouldUnescape={true}
        components={{
          signUp: (
            // biome-ignore lint/a11y/useAnchorContent: content is injected by Trans
            <a
              href={signUpHref}
              className="text-primary underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            />
          ),
        }}
      />
    </p>
  );
};

type GuestNoticeInput = {
  organization: { profile?: { displayName?: string; url?: string } } | undefined;
  isAuthenticated: boolean;
  loadingMe: boolean;
};

/**
 * Driven by auth state and the organization's identity only, never by the
 * resource data: once the organization is known a guest always sees it, so it
 * never reveals whether the organization hosts anything. Withheld while the
 * organization loads, so the name and the sign-up return URL are never blank.
 */
export const buildOrganizationGuestNotice = ({ organization, isAuthenticated, loadingMe }: GuestNoticeInput) =>
  organization && !loadingMe && !isAuthenticated ? (
    <OrganizationGuestResourcesNotice
      organizationName={organization.profile?.displayName ?? ''}
      signUpHref={buildSignUpUrl(organization.profile?.url)}
    />
  ) : undefined;

export const CrdOrganizationProfilePage = () => {
  const { t } = useTranslation('crd-profilePages');
  const navigate = useNavigate();
  const { organization, provided, isAuthenticated, loadingMe, accountResources, loading, refreshOrganization } =
    useCrdOrganizationProfilePageData();

  usePageTitle(organization?.profile?.displayName);

  const { onSendMessage } = useSendMessageToOrganizationHandler({
    recipientOrganizationId: organization?.id,
  });

  const [applyDialogOpen, setApplyDialogOpen] = useState(false);
  const [invitationDialogOpen, setInvitationDialogOpen] = useState(false);
  // Keyed to the organization: the `:organizationNameId/*` route element is
  // reused across organizations, so a plain boolean would carry "pending" onto
  // the next organization's profile (e.g. via the pending-memberships dialog).
  const [applicationJustSubmittedFor, setApplicationJustSubmittedFor] = useState<string | null>(null);

  const associateAction = useOrganizationAssociateAction({
    organizationId: organization?.id,
    roleSetId: organization?.roleSet.id,
    eligibilityReason: organization?.myAssociateEligibility.reason,
    membershipStatus: organization?.roleSet.myMembershipStatus,
    isAuthenticated,
    onJoined: refreshOrganization,
  });

  const invitationResponse = useOrgInvitationResponse(() => {
    setInvitationDialogOpen(false);
    refreshOrganization();
  }, associateAction.pendingInvitation?.invitation.id);

  const [leadItems, memberItems] = useFilteredMemberships(provided.contributions ?? [], [RoleType.Lead]);

  const { hostedVirtualContributors, hostedInnovationPacks, hostedInnovationHubs } = mapAccountHostedResources(
    accountResources,
    t('orgProfile.vcType')
  );
  const hasOtherResources =
    hostedVirtualContributors.length > 0 || hostedInnovationPacks.length > 0 || hostedInnovationHubs.length > 0;

  const tabs: ProfileResourceTab[] = [
    ...(leadItems.length > 0 ? [{ key: 'leading' as const, label: t('orgProfile.tabs.leading') }] : []),
    { key: 'memberOf', label: t('orgProfile.tabs.memberOf') },
    ...(hasOtherResources ? [{ key: 'otherResources' as const, label: t('orgProfile.tabs.otherResources') }] : []),
  ];
  const { activeTab, onSelectTab } = useResourceTabs(
    tabs.map(tab => tab.key),
    organization?.id
  );

  const breadcrumbDisplayName = organization?.profile?.displayName ?? '';
  const breadcrumbItems: BreadcrumbTrailItem[] = breadcrumbDisplayName
    ? [{ label: breadcrumbDisplayName, icon: Building2 }]
    : [];
  useSetBreadcrumbs(breadcrumbItems);

  if (!loading.context && !loading.provider && !organization) {
    return <CrdNotFoundView />;
  }

  const heroLoading = loading.context || loading.provider || !organization;
  const sidebarLoading = heroLoading;
  const hostedResourcesLoading = loading.account;
  const membershipsLoading = loading.provider;

  const id = organization?.id ?? '';
  const color = pickColorFromId(id);
  const profile = organization?.profile;

  const city = profile?.location?.city?.trim() ?? '';
  const country = profile?.location?.country?.trim() ?? '';
  const location =
    city && country
      ? t('common.locationFormat', { city, country })
      : city
        ? t('common.locationCityOnly', { city })
        : country
          ? t('common.locationCountryOnly', { country })
          : null;

  const verified = organization?.verification.status === OrganizationVerificationEnum.VerifiedManualAttestation;

  const settingsHref = orgSettingsHref(provided.permissions, profile?.url);

  const associatesCount = getMetricCount(organization?.metrics ?? [], MetricType.Associate);

  const tagsets = buildTagsetGroups([
    { key: 'keywords', name: t('orgProfile.sidebar.tagsetKeywords'), tags: provided.keywords },
    { key: 'capabilities', name: t('orgProfile.sidebar.tagsetCapabilities'), tags: provided.capabilities },
  ]);
  const references = normaliseReferences(provided.references);
  const associatesGrid = mapAssociates(
    provided.associates.map(a => ({
      id: a.id,
      displayName: a.displayName,
      avatar: a.avatar,
      url: a.url,
    }))
  );

  const leadSpaces = leadItems.map(item => <MembershipCardConnector key={item.id} contribution={item} />);
  const memberOf = memberItems.map(item => <MembershipCardConnector key={item.id} contribution={item} />);

  const applicationJustSubmitted = applicationJustSubmittedFor !== null && applicationJustSubmittedFor === id;
  const displayedAction = applicationJustSubmitted ? 'pending-application' : associateAction.action;
  const pendingInvitation = associateAction.pendingInvitation;
  const inviterName = pendingInvitation?.invitation.createdBy?.profile?.displayName;

  const guestNotice = buildOrganizationGuestNotice({ organization, isAuthenticated, loadingMe });

  return (
    <OrganizationPublicProfileView
      hero={{
        avatarImageUrl: profile?.avatar?.uri ?? null,
        color,
        displayName: profile?.displayName ?? '',
        tagline: profile?.tagline?.trim() || null,
        location,
        verified,
        settingsHref,
        onSendMessage: isAuthenticated ? onSendMessage : null,
        associateAction: (
          <OrganizationAssociateAction
            action={displayedAction}
            helperText={
              displayedAction === 'join' && organization?.myAssociateEligibility.canJoinDirectly
                ? t('orgProfile.associate.joinCaption')
                : undefined
            }
            loading={associateAction.joining}
            onJoin={associateAction.onJoin}
            onApply={() => setApplyDialogOpen(true)}
            onRespond={() => setInvitationDialogOpen(true)}
            onLogin={() => navigate(buildLoginUrl(profile?.url))}
          />
        ),
      }}
      sidebar={{
        bio: profile?.description ?? null,
        tagsets,
        references,
        associates: {
          associates: associatesGrid,
          totalCount: associatesCount,
          canReadUsers: provided.permissions.canReadUsers,
        },
        labels: {
          bioTitle: t('orgProfile.sidebar.bioTitle'),
          bioEmpty: t('orgProfile.sidebar.bioEmpty'),
          referencesTitle: t('orgProfile.sidebar.referencesTitle'),
          associatesTitle: count => t('orgProfile.sidebar.associatesCount', { count }),
          associatesSignInCta: t('associates-view.sign-in', { ns: 'crd-common' }),
          associatesShowMore: count => t('associates-view.more', { ns: 'crd-common', count }),
          associatesShowLess: t('associates-view.less', { ns: 'crd-common' }),
          socialLinksTitle: t('orgProfile.sidebar.socialLinksTitle'),
        },
      }}
      tabStrip={{
        tabs,
        activeTab,
        onSelectTab,
        ariaLabel: t('common.resourceTabsAriaLabel'),
      }}
      rightColumn={{
        activeTab,
        hostedVirtualContributors,
        hostedInnovationPacks,
        hostedInnovationHubs,
        leadSpaces,
        memberOf,
        labels: {
          virtualContributorsSubsection: t('orgProfile.sections.virtualContributorsSubsection'),
          templatePacksSubsection: t('common.innovation-packs', { ns: 'crd-common' }),
          customHomepagesSubsection: t('common.customHomepages', { ns: 'crd-common' }),
          spacesLeading: t('orgProfile.sections.spacesLeading'),
          memberOf: t('orgProfile.sections.memberOf'),
          emptyMembership: t('pages.user-profile.communities.noMembership', { ns: 'crd-common' }),
        },
      }}
      loading={{
        hero: heroLoading,
        sidebar: sidebarLoading,
        hostedResources: hostedResourcesLoading,
        memberships: membershipsLoading,
      }}
      loadingLabels={{
        hero: t('common.loading.hero'),
        sidebar: t('common.loading.sidebar'),
        hostedResources: t('common.loading.hostedResources'),
        memberships: t('common.loading.memberships'),
      }}
      guestNotice={guestNotice}
    >
      {organization && (
        <OrgApplyDialogConnector
          open={applyDialogOpen}
          onOpenChange={setApplyDialogOpen}
          organizationName={profile?.displayName ?? ''}
          roleSetId={organization.roleSet.id}
          applicationForm={organization.roleSet.applicationForm}
          onSubmitted={() => {
            setApplicationJustSubmittedFor(organization.id);
            refreshOrganization();
          }}
        />
      )}
      {pendingInvitation && (
        <OrgInvitationDetailDialog
          open={invitationDialogOpen}
          onOpenChange={open => {
            setInvitationDialogOpen(open);
            if (!open) invitationResponse.clearWithheldNotice();
          }}
          organizationName={pendingInvitation.organization.profile?.displayName ?? ''}
          organizationAvatarUrl={pendingInvitation.organization.profile?.avatar?.uri}
          organizationColor={pickColorFromId(pendingInvitation.organization.id)}
          offeredRoleLabel={t(
            `orgProfile.invitationDialog.offeredRole.${offeredRoleLabelKey(pendingInvitation.invitation.extraRoles)}`
          )}
          invitedByLabel={inviterName ? t('orgProfile.invitationDialog.invitedBy', { name: inviterName }) : undefined}
          message={pendingInvitation.invitation.welcomeMessage ?? undefined}
          onAccept={() => invitationResponse.onAccept(pendingInvitation.invitation.id)}
          onDecline={() => invitationResponse.onDecline(pendingInvitation.invitation.id)}
          accepting={invitationResponse.accepting}
          declining={invitationResponse.declining}
          withheldNotice={invitationResponse.withheldNotice}
        />
      )}
    </OrganizationPublicProfileView>
  );
};

export default CrdOrganizationProfilePage;
