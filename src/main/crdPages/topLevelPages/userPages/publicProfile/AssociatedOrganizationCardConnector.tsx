import { useTranslation } from 'react-i18next';
import { CompactContributorCard } from '@/crd/components/common/CompactContributorCard';
import { Skeleton } from '@/crd/primitives/skeleton';
import useAssociatedOrganization from '@/domain/community/organization/AssociatedOrganizations/useAssociatedOrganization';

export type AssociatedOrganizationCardConnectorProps = {
  organizationId: string;
};

/**
 * Integration-layer connector: lazily fetches one associated organisation
 * (via the existing MUI hook) and renders a CRD `CompactContributorCard`.
 *
 * Used by the User profile sidebar (FR-010).
 */
export function AssociatedOrganizationCardConnector({ organizationId }: AssociatedOrganizationCardConnectorProps) {
  const { t } = useTranslation('crd-profilePages');
  const data = useAssociatedOrganization({ organizationId });

  // Loading and "resolved but no profile" are different terminal states.
  // Show the skeleton only while the hook is in flight; if it resolves with
  // no profile (404, deleted org, lacking permission), render nothing rather
  // than a permanent skeleton.
  if (data.loading) {
    return <Skeleton className="h-16 w-full rounded-xl" />;
  }
  if (!data.profile) {
    return null;
  }

  const memberCount = data.associatesCount ?? 0;
  const memberCountLabel = t('userProfile.sidebar.memberCountLine', { count: memberCount });

  return (
    <CompactContributorCard
      id={organizationId}
      displayName={data.profile.displayName}
      avatarImageUrl={data.profile.avatar?.uri ?? null}
      caption={null}
      secondaryCaption={null}
      href={data.profile.url}
      badge={{ label: String(memberCount), icon: 'users' }}
      ariaLabel={`${data.profile.displayName} — ${memberCountLabel}`}
    />
  );
}
