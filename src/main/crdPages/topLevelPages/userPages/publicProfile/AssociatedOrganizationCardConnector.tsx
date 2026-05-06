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

  if (data.loading || !data.profile) {
    return <Skeleton className="h-16 w-full rounded-xl" />;
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
