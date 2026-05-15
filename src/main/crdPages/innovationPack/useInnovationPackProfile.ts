import { useEffect, useState } from 'react';
import { useInnovationPackProfilePageQuery } from '@/core/apollo/generated/apollo-hooks';
import { AuthorizationPrivilege, type InnovationPackProfilePageQuery } from '@/core/apollo/generated/graphql-schema';
import type { InnovationPackProfileViewProps } from '@/crd/components/innovationPack/InnovationPackProfileView';
import { pickColorFromId } from '@/crd/lib/pickColorFromId';
import { useTemplatesManager } from '@/main/crdPages/templates/useTemplatesManager';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

type GqlProfilePack = NonNullable<InnovationPackProfilePageQuery['lookup']['innovationPack']>;

export type UseInnovationPackProfileResult = {
  loading: boolean;
  notFound: boolean;
  innovationPackId: string | undefined;
  /** Pack data shaped for `InnovationPackProfileView` (undefined while loading). */
  pack: InnovationPackProfileViewProps['pack'] | undefined;
  /** Holder-agnostic templates manager bound to the pack's templates set — read-only listing + preview. */
  tm: ReturnType<typeof useTemplatesManager>;
  /** True when the viewer has `Update` privilege on the pack — i.e. should see "Manage this pack". */
  canManage: boolean;
  /** `<pack.profile.url>/settings` — passed to `InnovationPackProfileView` only when `canManage`. */
  adminHref: string | undefined;
  /** Public share URL — the pack's profile.url. */
  shareUrl: string;
};

/** Map the GraphQL pack profile to the plain `InnovationPackProfileViewProps['pack']` shape. */
function mapProfilePackToCard(gql: GqlProfilePack): InnovationPackProfileViewProps['pack'] {
  const profile = gql.profile;
  const provider = gql.provider;
  return {
    id: gql.id,
    name: profile.displayName,
    description: profile.description ?? '',
    tagline: profile.tagline,
    tags: profile.tagset?.tags ?? [],
    bannerUrl: profile.avatar?.uri || undefined,
    color: pickColorFromId(gql.id),
    // We don't have aggregate counts here — the templates manager exposes them per-section
    // (and the public profile is not the place to show a "{N} templates" badge anyway).
    templateCount: 0,
    url: profile.url,
    providerName: provider?.profile?.displayName,
    providerAvatarUrl: provider?.profile?.avatar?.uri || undefined,
    providerUrl: provider?.profile?.url,
    references: (profile.references ?? []).map(r => ({
      id: r.id,
      name: r.name,
      uri: r.uri,
      description: r.description,
    })),
  };
}

/**
 * Drives {@link CrdInnovationPackProfilePage}. Resolves the pack id (and any deep-linked
 * template id) from the route, loads the pack's public profile via
 * `useInnovationPackProfilePageQuery`, and threads its templates set through the
 * holder-agnostic {@link useTemplatesManager} so the page renders a read-only listing
 * with a working preview dialog. Anonymous-accessible — the route is not behind an
 * identity gate (FR-050).
 *
 * The legacy template deep-link (`<pack.profile.url>/:templateNameId`) is preserved:
 * the URL still resolves; in CRD it opens that template's read-only Preview dialog
 * (the legacy pack-profile behaviour was also Preview, so this is unchanged).
 */
export function useInnovationPackProfile(): UseInnovationPackProfileResult {
  const { innovationPackId, templateId, loading: resolvingUrl } = useUrlResolver();

  const { data, loading: loadingPack } = useInnovationPackProfilePageQuery({
    variables: { innovationPackId: innovationPackId ?? '' },
    skip: !innovationPackId,
  });
  const gqlPack = data?.lookup.innovationPack;
  const pack = gqlPack ? mapProfilePackToCard(gqlPack) : undefined;
  const templatesSetId = gqlPack?.templatesSet?.id;
  const canManage = gqlPack?.authorization?.myPrivileges?.includes(AuthorizationPrivilege.Update) ?? false;
  const adminHref = canManage && pack ? `${pack.url}/settings` : undefined;
  const shareUrl = pack?.url ?? '';

  const tm = useTemplatesManager({ holderKind: 'innovationPack', templatesSetId });

  // Open the deep-linked template's Preview dialog once the set resolves.
  const [deepLinkedTemplateId, setDeepLinkedTemplateId] = useState<string | null>(null);
  useEffect(() => {
    if (!templateId || templateId === deepLinkedTemplateId || tm.loading || !templatesSetId) return;
    setDeepLinkedTemplateId(templateId);
    tm.onTemplateAction(templateId, 'preview');
  }, [templateId, deepLinkedTemplateId, templatesSetId, tm]);

  const loading = resolvingUrl || (Boolean(innovationPackId) && loadingPack);
  const notFound = !loading && Boolean(innovationPackId) && !gqlPack;

  return { loading, notFound, innovationPackId, pack, tm, canManage, adminHref, shareUrl };
}
