import { ExternalLink, Package, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { CollapsibleTagList } from '@/crd/components/common/CollapsibleTagList';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { ShareButton } from '@/crd/components/common/ShareButton';
import { TemplatesManagerView } from '@/crd/components/templates/TemplatesManagerView';
import type { TemplateCategorySection } from '@/crd/components/templates/types';
import { backgroundGradient } from '@/crd/lib/backgroundGradient';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Separator } from '@/crd/primitives/separator';
import type { InnovationPackCardData } from './types';

export type InnovationPackProfileViewProps = {
  /** Pack + references list (the public-profile query reads the references on the pack profile). */
  pack: InnovationPackCardData & {
    /** Optional tagline / short subtitle. */
    tagline?: string;
    references: { id: string; name: string; uri: string; description?: string }[];
  };
  /** Read-only listing of the pack's templates by type. */
  templates: TemplateCategorySection[];
  templatesLoading?: boolean;
  /** Show the "Manage this pack" entry point. */
  canManage: boolean;
  adminHref?: string;
  /** Only 'preview' is meaningful on the public profile — kebab is hidden via the all-false `can*` predicates. */
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
 * Layout:
 *  - Hero: banner (image or `color` gradient fallback) + avatar + name + tagline,
 *    with Share + "Manage this pack" actions on the right.
 *  - Sidebar (left, on lg+): provider card (avatar/name → providerUrl), tags, references.
 *  - Main (right, on lg+): the holder-agnostic `TemplatesManagerView` rendered read-only
 *    (`can*` all `() => false`); `onTemplateAction` is filtered to `'preview'` and routed
 *    to the consumer.
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
    // Edit/duplicate/delete are gated off by the `can*` predicates above — they never fire here.
  };

  const providerInitials = pack.providerName
    ? pack.providerName
        .split(/\s+/)
        .map(part => part[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : '?';

  return (
    <div className={className}>
      {/* Hero */}
      <section aria-labelledby="pack-profile-heading" className="space-y-4">
        <div className="relative aspect-[6/1] w-full overflow-hidden rounded-md min-h-32" aria-hidden={!pack.bannerUrl}>
          {pack.bannerUrl ? (
            <img src={pack.bannerUrl} alt="" className="size-full object-cover" />
          ) : (
            <div className="flex size-full items-center justify-center" style={backgroundGradient(pack.color)}>
              <Package aria-hidden="true" className="size-16 text-white/80" />
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            <Avatar className="size-14 shrink-0 -mt-10 border-4 border-background shadow-sm">
              {pack.bannerUrl ? (
                <AvatarImage src={pack.bannerUrl} alt="" />
              ) : (
                <AvatarFallback aria-hidden="true" className="text-white" style={{ backgroundColor: pack.color }}>
                  <Package aria-hidden="true" className="size-6" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="min-w-0 flex-1 pt-1">
              <h1 id="pack-profile-heading" className="text-hero">
                {pack.name}
              </h1>
              {pack.tagline && <p className="text-body text-muted-foreground">{pack.tagline}</p>}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ShareButton url={shareUrl} tooltip={t('packProfile.shareTooltip')} />
            {canManage && adminHref && (
              <Button asChild={true} variant="outline" size="sm">
                <a href={adminHref}>
                  <Settings aria-hidden="true" className="size-4 mr-2" />
                  {t('packProfile.manage')}
                </a>
              </Button>
            )}
          </div>
        </div>

        {pack.description && <MarkdownContent content={pack.description} className="text-body text-muted-foreground" />}
      </section>

      <Separator className="my-6" />

      {/* Body: sidebar + templates */}
      <div className="grid gap-6 lg:grid-cols-[1fr_2fr]">
        {/* Sidebar */}
        <aside aria-labelledby="pack-profile-sidebar" className="space-y-6">
          <h2 id="pack-profile-sidebar" className="sr-only">
            {t('packProfile.sidebarLabel')}
          </h2>

          {/* Provider */}
          <section aria-labelledby="pack-profile-provider" className="space-y-2 rounded-md border bg-card p-4">
            <h3 id="pack-profile-provider" className="text-label uppercase text-muted-foreground">
              {t('packProfile.provider')}
            </h3>
            {pack.providerName ? (
              <div className="flex items-center gap-2">
                <Avatar className="size-9 shrink-0">
                  {pack.providerAvatarUrl ? (
                    <AvatarImage src={pack.providerAvatarUrl} alt="" />
                  ) : (
                    <AvatarFallback aria-hidden="true" className="text-white" style={{ backgroundColor: pack.color }}>
                      {providerInitials}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="min-w-0 flex-1">
                  {pack.providerUrl ? (
                    <a
                      href={pack.providerUrl}
                      className="text-body-emphasis hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm truncate block"
                    >
                      {pack.providerName}
                    </a>
                  ) : (
                    <p className="text-body-emphasis truncate">{pack.providerName}</p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-body text-muted-foreground italic">{t('packProfile.providerUnknown')}</p>
            )}
          </section>

          {/* Tags */}
          {pack.tags.length > 0 && (
            <section aria-labelledby="pack-profile-tags" className="space-y-2 rounded-md border bg-card p-4">
              <h3 id="pack-profile-tags" className="text-label uppercase text-muted-foreground">
                {t('packProfile.tags')}
              </h3>
              <CollapsibleTagList tags={pack.tags} />
            </section>
          )}

          {/* References */}
          <section aria-labelledby="pack-profile-references" className="space-y-2 rounded-md border bg-card p-4">
            <h3 id="pack-profile-references" className="text-label uppercase text-muted-foreground">
              {t('packProfile.references')}
            </h3>
            {pack.references.length === 0 ? (
              <p className="text-body text-muted-foreground italic">{t('packProfile.referencesEmpty')}</p>
            ) : (
              <ul className="space-y-2">
                {pack.references.map(ref => (
                  <li key={ref.id} className="space-y-0.5">
                    <a
                      href={ref.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-body-emphasis text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-sm inline-flex items-center gap-1"
                    >
                      <span className="truncate">{ref.name}</span>
                      <ExternalLink aria-hidden="true" className="size-3 shrink-0" />
                    </a>
                    {ref.description && <p className="text-caption text-muted-foreground">{ref.description}</p>}
                  </li>
                ))}
              </ul>
            )}
          </section>
        </aside>

        {/* Templates */}
        <section aria-labelledby="pack-profile-templates" className="space-y-3 min-w-0">
          <h2 id="pack-profile-templates" className="text-section-title">
            {t('packProfile.templatesHeading')}
          </h2>
          <TemplatesManagerView
            holderKind="innovationPack"
            categories={templates}
            loading={templatesLoading}
            {...READ_ONLY_PREDICATES}
            onCreate={() => undefined}
            onImport={() => undefined}
            onTemplateAction={handleTemplateAction}
          />
        </section>
      </div>
    </div>
  );
}
