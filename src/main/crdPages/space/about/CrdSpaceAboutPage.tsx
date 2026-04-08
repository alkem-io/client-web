import { useSpaceAboutDetailsQuery } from '@/core/apollo/generated/apollo-hooks';
import Loading from '@/core/ui/loading/Loading';
import { SpaceAboutView } from '@/crd/components/space/SpaceAboutView';
import { useSpace } from '@/domain/space/context/useSpace';

export default function CrdSpaceAboutPage() {
  const { space } = useSpace();

  const { data, loading } = useSpaceAboutDetailsQuery({
    variables: { spaceId: space.id },
    skip: !space.id,
  });

  if (loading) return <Loading />;

  const about = data?.lookup.space?.about;
  if (!about) return null;

  const profile = about.profile;

  const leadUsers = (about.membership?.leadUsers ?? [])
    .filter((u): u is typeof u & { profile: NonNullable<typeof u.profile> } => !!u.profile)
    .map(u => ({
      name: u.profile.displayName,
      avatarUrl: u.profile.avatar?.uri,
      type: 'person' as const,
      location: [u.profile.location?.city, u.profile.location?.country].filter(Boolean).join(', ') || undefined,
      href: u.profile.url,
    }));

  const leadOrgs = (about.membership?.leadOrganizations ?? [])
    .filter((o): o is typeof o & { profile: NonNullable<typeof o.profile> } => !!o.profile)
    .map(o => ({
      name: o.profile.displayName,
      avatarUrl: o.profile.avatar?.uri,
      type: 'organization' as const,
      location: [o.profile.location?.city, o.profile.location?.country].filter(Boolean).join(', ') || undefined,
      href: o.profile.url,
    }));

  const provider = about.provider?.profile
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

  const aboutData = {
    name: profile.displayName,
    tagline: profile.tagline ?? undefined,
    description: profile.description ?? undefined,
    location: [profile.location?.city, profile.location?.country].filter(Boolean).join(', ') || undefined,
    metrics: (about.metrics ?? []).map(m => ({ name: m.name, value: m.value })),
    who: about.who ?? undefined,
    why: about.why ?? undefined,
    provider,
    leadUsers,
    leadOrganizations: leadOrgs,
    guidelines: undefined, // Guidelines only has id in the query, no text content
    references: (profile.references ?? []).map(r => ({
      name: r.name,
      uri: r.uri,
      description: r.description ?? undefined,
    })),
  };

  return <SpaceAboutView data={aboutData} />;
}
