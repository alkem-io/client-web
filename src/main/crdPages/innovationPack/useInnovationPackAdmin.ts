import { useEffect, useState } from 'react';
import { useAdminInnovationPackQuery } from '@/core/apollo/generated/apollo-hooks';
import { useTemplatesManager } from '@/main/crdPages/templates/useTemplatesManager';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import { type InnovationPackBasics, mapInnovationPackToBasics } from './innovationPackMapper';

export type UseInnovationPackAdminResult = {
  loading: boolean;
  notFound: boolean;
  innovationPackId: string | undefined;
  pack: InnovationPackBasics | undefined;
  tm: ReturnType<typeof useTemplatesManager>;
};

/**
 * Drives {@link CrdInnovationPackAdminPage}. Resolves the pack id from the route
 * (`<pack.profile.url>/settings`), loads the pack + its templates set, and hands the
 * templates surface off to the holder-agnostic {@link useTemplatesManager}
 * (`holderKind: 'innovationPack'`). Page access is the gate — no per-type authz.
 *
 * The legacy template deep-link (`<pack.profile.url>/settings/<templateId>`) is preserved:
 * the URL still resolves, and in CRD it opens that template's read-only Preview dialog
 * (the legacy "pack deep-link → straight to Edit" behaviour is intentionally dropped).
 */
export function useInnovationPackAdmin(): UseInnovationPackAdminResult {
  const { innovationPackId, templateId, loading: resolvingUrl } = useUrlResolver();

  const { data, loading: loadingPack } = useAdminInnovationPackQuery({
    variables: { innovationPackId: innovationPackId ?? '' },
    skip: !innovationPackId,
  });
  const gqlPack = data?.lookup.innovationPack;
  const pack = gqlPack ? mapInnovationPackToBasics(gqlPack) : undefined;
  const templatesSetId = pack?.templatesSetId;

  const tm = useTemplatesManager({ holderKind: 'innovationPack', templatesSetId });

  // Open the deep-linked template's Preview dialog once it (and the templates set) resolve.
  const [deepLinkedTemplateId, setDeepLinkedTemplateId] = useState<string | null>(null);
  useEffect(() => {
    if (!templateId || templateId === deepLinkedTemplateId || tm.loading || !templatesSetId) return;
    setDeepLinkedTemplateId(templateId);
    tm.onTemplateAction(templateId, 'preview');
  }, [templateId, deepLinkedTemplateId, templatesSetId, tm]);

  const loading = resolvingUrl || (Boolean(innovationPackId) && loadingPack);
  const notFound = !loading && Boolean(innovationPackId) && !gqlPack;

  return { loading, notFound, innovationPackId, pack, tm };
}
