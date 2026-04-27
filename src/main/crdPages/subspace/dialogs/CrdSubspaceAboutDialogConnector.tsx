import { useTranslation } from 'react-i18next';
import { useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import { SpaceAboutDialog } from '@/crd/components/space/SpaceAboutDialog';
import type { SpaceAboutData } from '@/crd/components/space/SpaceAboutView';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';

type CrdSubspaceAboutDialogConnectorProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

/**
 * Subspace-scoped wrapper around SpaceAboutDialog. Reads the subspace via
 * SubspaceContext (so we don't show the L0 about by mistake) and fetches the
 * full about details via the existing query.
 *
 * Edit-affordances and apply CTAs are intentionally omitted here per spec 091:
 * the apply CTA lives on the banner, and L1 settings is still legacy MUI (the
 * settings icon links there instead of editing inline).
 */
export function CrdSubspaceAboutDialogConnector({ open, onOpenChange }: CrdSubspaceAboutDialogConnectorProps) {
  const { t } = useTranslation('crd-space');
  const { subspace, permissions } = useSubSpace();

  const { data } = useSpaceAboutDetailsQuery({
    variables: { spaceId: subspace.id },
    skip: !open || !subspace.id,
  });

  const about = data?.lookup.space?.about;
  const profile = about?.profile;

  const leadUsers = (about?.membership?.leadUsers ?? [])
    .filter((u): u is typeof u & { profile: NonNullable<typeof u.profile> } => !!u.profile)
    .map(u => ({
      name: u.profile.displayName,
      avatarUrl: u.profile.avatar?.uri,
      type: 'person' as const,
      location: [u.profile.location?.city, u.profile.location?.country].filter(Boolean).join(', ') || undefined,
      href: u.profile.url,
    }));

  const leadOrgs = (about?.membership?.leadOrganizations ?? [])
    .filter((o): o is typeof o & { profile: NonNullable<typeof o.profile> } => !!o.profile)
    .map(o => ({
      name: o.profile.displayName,
      avatarUrl: o.profile.avatar?.uri,
      type: 'organization' as const,
      location: [o.profile.location?.city, o.profile.location?.country].filter(Boolean).join(', ') || undefined,
      href: o.profile.url,
    }));

  const provider = about?.provider?.profile
    ? {
        name: about.provider.profile.displayName,
        avatarUrl: about.provider.profile.avatar?.uri,
        type: 'organization' as const,
        location:
          [about.provider.profile.location?.city, about.provider.profile.location?.country]
            .filter(Boolean)
            .join(', ') || undefined,
        href: about.provider.profile.url,
      }
    : undefined;

  const aboutData: SpaceAboutData = {
    name: profile?.displayName ?? subspace.about.profile.displayName,
    tagline: profile?.tagline ?? subspace.about.profile.tagline ?? undefined,
    description: profile?.description ?? undefined,
    location: [profile?.location?.city, profile?.location?.country].filter(Boolean).join(', ') || undefined,
    metrics: (about?.metrics ?? []).map(m => ({ name: m.name, value: m.value })),
    who: about?.who ?? undefined,
    why: about?.why ?? undefined,
    provider,
    leadUsers,
    leadOrganizations: leadOrgs,
    references: (profile?.references ?? []).map(r => ({
      name: r.name,
      uri: r.uri,
      description: r.description ?? undefined,
    })),
  };

  const whyTitle = t(`about.context.${subspace.level}.why`);
  const whoTitle = t(`about.context.${subspace.level}.who`);

  return (
    <SpaceAboutDialog
      open={open}
      onOpenChange={onOpenChange}
      data={aboutData}
      whyTitle={whyTitle}
      whoTitle={whoTitle}
      hasEditPrivilege={permissions.canUpdate}
    />
  );
}
