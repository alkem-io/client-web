import { Library, Package } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { Error404 } from '@/core/pages/Errors/Error404';
import { usePageTitle } from '@/core/routing/usePageTitle';
import type { BreadcrumbTrailItem } from '@/crd/components/common/BreadcrumbsTrail';
import { InnovationPackProfileView } from '@/crd/components/innovationPack/InnovationPackProfileView';
import { TemplatePreviewDialog } from '@/crd/components/templates/TemplatePreviewDialog';
import { TopLevelRoutePath } from '@/main/routing/TopLevelRoutePath';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { useInnovationPackProfile } from './useInnovationPackProfile';

/**
 * Innovation Pack public profile (`<pack.profile.url>`), CRD-native — anonymous-accessible (FR-050).
 *
 * Renders the pack hero (name / tagline / banner / description), a sidebar with the provider
 * card + tags + references, and a read-only listing of the pack's templates by type. A
 * "Manage this pack" entry to `<pack.url>/settings` is shown only when the viewer has the
 * `Update` privilege on the pack.
 *
 * The pack admin (`<pack.url>/settings`) lives in {@link CrdInnovationPackAdminPage}, routed
 * from the same `InnovationPackRoute.tsx` (US2 already toggle-gates the admin half; T080
 * extends the same gate to wrap this public profile route).
 */
export const CrdInnovationPackProfilePage = () => {
  const { t } = useTranslation();
  const { t: tTemplates } = useTranslation('crd-templates');
  const { loading, notFound, pack, tm, canManage, adminHref, shareUrl } = useInnovationPackProfile();
  // "[Pack Name] | Template Library | Alkemio" — mirrors the MUI InnovationPackProfileLayout.
  const pageTitle = pack?.name
    ? `${pack.name}${t('pages.titles.separator')}${t('pages.titles.templateLibrary')}`
    : undefined;
  usePageTitle(pageTitle);

  const breadcrumbItems: BreadcrumbTrailItem[] = pack
    ? [
        { label: tTemplates('library.title'), href: `/${TopLevelRoutePath.InnovationLibrary}`, icon: Library },
        { label: pack.name, icon: Package },
      ]
    : [];
  useSetBreadcrumbs(breadcrumbItems);

  if (notFound) {
    return <Error404 />;
  }

  // Until the pack resolves we render a minimal placeholder rather than mounting the View
  // with a half-formed prop shape. The Suspense fallback above this page renders the loader.
  if (!pack) {
    return <div className="crd-root container mx-auto px-4 md:px-8 py-6" aria-busy={true} />;
  }

  return (
    <>
      <div className="crd-root container mx-auto px-4 md:px-8 py-6">
        <InnovationPackProfileView
          pack={pack}
          templates={tm.categories}
          templatesLoading={loading || tm.loading}
          canManage={canManage}
          adminHref={adminHref}
          onTemplatePreview={id => tm.onTemplateAction(id, 'preview')}
          shareUrl={shareUrl}
        />
      </div>

      {tm.preview.header && (
        <TemplatePreviewDialog
          open={tm.preview.open}
          onClose={tm.preview.onClose}
          header={tm.preview.header}
          content={tm.preview.content}
          contentLoading={tm.preview.contentLoading}
          // Public profile is read-only — the Preview's Edit affordance is hidden regardless of `canEdit`.
        />
      )}
    </>
  );
};

export default CrdInnovationPackProfilePage;
