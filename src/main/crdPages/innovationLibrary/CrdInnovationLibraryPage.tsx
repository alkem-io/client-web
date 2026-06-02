import { Library } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { usePageTitle } from '@/core/routing/usePageTitle';
import { InnovationLibraryView } from '@/crd/components/innovationLibrary/InnovationLibraryView';
import { TemplatePreviewDialog } from '@/crd/components/templates/TemplatePreviewDialog';
import { useSetBreadcrumbs } from '@/main/ui/breadcrumbs/BreadcrumbsContext';
import { useInnovationLibrary } from './useInnovationLibrary';

/**
 * `/innovation-library` — CRD-native Innovation Library page. Anonymous access
 * (the route is not behind an identity gate; FR-050). Loads everything in a
 * single `useInnovationLibraryQuery`; filtering is client-side; selecting a
 * card opens the shared `TemplatePreviewDialog`.
 */
export const CrdInnovationLibraryPage = () => {
  const { t } = useTranslation('crd-templates');
  const lib = useInnovationLibrary();
  usePageTitle(t('library.pageTitle'));
  useSetBreadcrumbs([{ label: t('library.title'), icon: Library }]);

  return (
    <div className="crd-root mx-auto w-full max-w-7xl space-y-6 px-4 py-6">
      <header className="space-y-1">
        <h1 className="text-page-title">{t('library.title')}</h1>
        <p className="text-body text-muted-foreground">{t('library.subtitle')}</p>
      </header>

      <InnovationLibraryView
        packs={lib.packs}
        packsLoading={lib.loading}
        templates={lib.templates}
        templatesLoading={lib.loading}
        activeTypeFilter={lib.activeTypeFilter}
        onChangeTypeFilter={lib.onChangeTypeFilter}
        onTemplatePreview={lib.onTemplatePreview}
      />

      {lib.previewTemplate && (
        <TemplatePreviewDialog
          open={true}
          onClose={lib.closePreview}
          header={lib.previewTemplate}
          content={lib.previewContent}
          contentLoading={lib.previewLoading}
        />
      )}
    </div>
  );
};

export default CrdInnovationLibraryPage;
