import { Package, Settings } from 'lucide-react';
import { Fragment, type ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { ShareButton } from '@/crd/components/common/ShareButton';
import { TemplatesManagerView } from '@/crd/components/templates/TemplatesManagerView';
import type { TemplateCategorySection } from '@/crd/components/templates/types';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { Badge } from '@/crd/primitives/badge';
import { Button } from '@/crd/primitives/button';
import { Separator } from '@/crd/primitives/separator';
import type { InnovationPackCardData } from './types';

export type InnovationPackProfileViewProps = {
  pack: InnovationPackCardData & {
    /** Optional tagline / short subtitle. */
    tagline?: string;
    references?: { id: string; name: string; uri: string; description?: string }[];
  };
  templates: TemplateCategorySection[];
  templatesLoading?: boolean;
  /**
   * Show the manage entry point. Rendered as the SAME settings cogwheel used by the User / Org / VC profile
   * heroes: an icon-only `Button variant="secondary" size="icon"` linking to `adminHref`, `title` + `aria-label`
   * from `packProfile.manage`.
   */
  canManage: boolean;
  adminHref?: string;
  /** Only 'preview' is meaningful on the public profile — the read-only manager emits nothing else. */
  onTemplatePreview: (templateId: string) => void;
  shareUrl: string;
  className?: string;
};

const READ_ONLY_PREDICATES = {
  canCreate: () => false,
  canEdit: () => false,
  canDelete: () => false,
  canImport: () => false,
};

/**
 * Public-profile view of an Innovation Pack — anonymous-accessible (FR-050).
 *
 * Follows the prototype's `TemplatePackDetail` layout (NOT a banner/avatar hero):
 *  - Compact header: a 64px rounded thumbnail (the pack avatar, or a `pickColorFromId` gradient + Package
 *    fallback) + name + markdown description + a single meta row (`{N} templates` · `by {provider}` · tag chips),
 *    with `ShareButton` + the manage cogwheel on the right. No top banner, no overlapping avatar, no sidebar.
 *  - Body: the holder-agnostic `TemplatesManagerView`, full-width and read-only (`readOnly`, all `can*` false);
 *    `onTemplateAction` is filtered to `'preview'` and routed to the consumer.
 *
 * Pure CRD — no Apollo, no routing, no business logic. The consumer fetches the data
 * and wires `onTemplatePreview` / `adminHref` / `shareUrl`.
 */
export function InnovationPackProfileView({
  pack,
  templates,
  templatesLoading,
  canManage,
  adminHref,
  onTemplatePreview,
  shareUrl,
  className,
}: InnovationPackProfileViewProps) {
  const { t } = useTranslation('crd-templates');

  const handleTemplateAction = (id: string, action: 'preview' | 'edit' | 'duplicate' | 'delete') => {
    if (action === 'preview') onTemplatePreview(id);
    // Read-only: the manager never emits edit/duplicate/delete here.
  };

  const templateCount = templates.reduce((sum, section) => sum + section.templates.length, 0);

  const providerLabel = pack.providerName ? t('packCard.byProvider', { name: pack.providerName }) : null;

  // Meta segments are interleaved with vertical separators; building them as a list avoids a dangling
  // leading separator when the count is still loading or the provider is unknown.
  const metaSegments: { key: string; node: ReactNode }[] = [];
  if (!templatesLoading && templateCount > 0) {
    metaSegments.push({
      key: 'count',
      node: (
        <Badge variant="secondary" className="text-caption">
          {t('packCard.templateCount', { count: templateCount })}
        </Badge>
      ),
    });
  }
  if (providerLabel) {
    metaSegments.push({
      key: 'provider',
      node: pack.providerUrl ? (
        <a
          href={pack.providerUrl}
          className="text-caption text-muted-foreground rounded-sm hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          {providerLabel}
        </a>
      ) : (
        <span className="text-caption text-muted-foreground">{providerLabel}</span>
      ),
    });
  }
  if (pack.tags.length > 0) {
    metaSegments.push({
      key: 'tags',
      node: (
        <ul className="flex flex-wrap gap-1.5">
          {pack.tags.map(tag => (
            <li key={tag} className="text-caption text-muted-foreground bg-muted/50 rounded px-1.5 py-0.5">
              {tag}
            </li>
          ))}
        </ul>
      ),
    });
  }

  return (
    <div className={className}>
      {/* Header — compact, prototype TemplatePackDetail style (no banner, no sidebar). */}
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="hidden size-16 shrink-0 overflow-hidden rounded-lg border sm:block">
            {pack.bannerUrl ? (
              <img src={pack.bannerUrl} alt="" className="size-full object-cover" />
            ) : (
              <div className="flex size-full items-center justify-center" style={backgroundGradient(pack.color)}>
                <Package aria-hidden="true" className="size-7 text-white/80" />
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h1 className="text-page-title">{pack.name}</h1>
            {pack.description && (
              <MarkdownContent content={pack.description} className="text-body text-muted-foreground mt-1" />
            )}

            {metaSegments.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2">
                {metaSegments.map((segment, index) => (
                  <Fragment key={segment.key}>
                    {index > 0 && <Separator orientation="vertical" className="h-4" />}
                    {segment.node}
                  </Fragment>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <ShareButton url={shareUrl} tooltip={t('packProfile.shareTooltip')} />
          {canManage && adminHref && (
            <Button
              asChild={true}
              variant="secondary"
              size="icon"
              className="shadow-sm"
              title={t('packProfile.manage')}
            >
              <a href={adminHref} aria-label={t('packProfile.manage')}>
                <Settings aria-hidden="true" className="size-4" />
              </a>
            </Button>
          )}
        </div>
      </header>

      <Separator className="my-6" />

      {/* Body — full-width read-only templates manager. */}
      <TemplatesManagerView
        holderKind="innovationPack"
        categories={templates}
        loading={templatesLoading}
        readOnly={true}
        {...READ_ONLY_PREDICATES}
        onCreate={() => undefined}
        onImport={() => undefined}
        onTemplateAction={handleTemplateAction}
      />
    </div>
  );
}
