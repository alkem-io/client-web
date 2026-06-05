import { ExternalLink, Globe, type LucideIcon, MapPin, Pencil, Target, UserCheck, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

type SpaceLeadData = {
  name: string;
  avatarUrl?: string;
  type: 'person' | 'organization';
  location?: string;
  href: string;
};

type CalloutReference = {
  name: string;
  uri: string;
  description?: string;
};

export type SpaceAboutData = {
  name: string;
  tagline?: string;
  description?: string;
  location?: string;
  metrics: Array<{ name: string; value: string }>;
  who?: string;
  why?: string;
  provider?: SpaceLeadData;
  leadUsers: SpaceLeadData[];
  leadOrganizations: SpaceLeadData[];
  references: CalloutReference[];
};

type SpaceAboutViewProps = {
  data: SpaceAboutData;
  className?: string;
  /** Apply / Join CTA rendered below the space-info panel when the viewer can join. */
  joinSlot?: ReactNode;
  /** CommunityGuidelinesBlock from the integration layer. */
  guidelinesSlot?: ReactNode;
  /** Single-line "Contact host" affordance rendered inside the host block. */
  contactHostSlot?: ReactNode;
  whyTitle?: string;
  whoTitle?: string;
  /** Members count for the space-info panel (`metrics` entry whose name === 'members'). */
  memberCount?: string;
  /** True when the viewer is already a member of this community — drives the UserCheck badge. */
  isMember?: boolean;
  hasEditPrivilege?: boolean;
  /** "Edit space profile" on the panel — navigates to settings/about. */
  onEditDescription?: () => void;
  onEditWhy?: () => void;
  onEditWho?: () => void;
  onEditReferences?: () => void;
  /** "Manage community" on the panel — navigates to settings/community. */
  onEditMembers?: () => void;
};

// Force light markdown colors when rendered on the dark accent panel. MarkdownContent
// hardcodes foreground/muted-foreground tokens via descendant selectors; the `!` important
// modifier overrides them the same way the tooltip primitive does for its dark surface.
const MARKDOWN_ON_DARK =
  '[&_p]:!text-primary-foreground/90 [&_strong]:!text-primary-foreground [&_em]:!text-primary-foreground/90 ' +
  '[&_h1]:!text-primary-foreground [&_h2]:!text-primary-foreground [&_h3]:!text-primary-foreground [&_h4]:!text-primary-foreground ' +
  '[&_li]:!text-primary-foreground/90 [&_a]:!text-primary-foreground [&_a]:underline ' +
  '[&_blockquote]:!text-primary-foreground/80 [&_blockquote]:!border-primary-foreground/30';

export function SpaceAboutView({
  data,
  className,
  joinSlot,
  guidelinesSlot,
  contactHostSlot,
  whyTitle,
  whoTitle,
  memberCount,
  isMember,
  hasEditPrivilege = false,
  onEditDescription,
  onEditWhy,
  onEditWho,
  onEditReferences,
  onEditMembers,
}: SpaceAboutViewProps) {
  const { t } = useTranslation('crd-space');

  const leads = [...data.leadUsers, ...data.leadOrganizations];
  const hasLeads = leads.length > 0;

  return (
    <div className={cn('max-w-3xl mx-auto space-y-6', className)}>
      {/* ── Space info panel: description + meta + leads (dark accent) ── */}
      <div className="rounded-lg bg-primary text-primary-foreground overflow-hidden">
        {hasEditPrivilege && (onEditDescription || onEditMembers) && (
          <div className="flex justify-end gap-1 px-4 pt-3">
            {onEditDescription && (
              <EditIconButton
                icon={Pencil}
                label={t('about.editProfile')}
                onClick={onEditDescription}
                className="text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              />
            )}
            {onEditMembers && (
              <EditIconButton
                icon={Users}
                label={t('about.manageCommunity')}
                onClick={onEditMembers}
                className="text-primary-foreground/70 hover:bg-primary-foreground/10 hover:text-primary-foreground"
              />
            )}
          </div>
        )}

        <div className={cn(hasEditPrivilege && (onEditDescription || onEditMembers) ? 'px-5 pb-5 pt-2' : 'p-5')}>
          {data.description && <MarkdownContent content={data.description} className={MARKDOWN_ON_DARK} />}

          {/* Meta row: location + members + member badge */}
          {(data.location || memberCount !== undefined || isMember) && (
            <div className="flex flex-wrap items-center gap-4 mt-4 text-caption text-primary-foreground/70">
              {data.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3" aria-hidden="true" />
                  {data.location}
                </span>
              )}
              {memberCount !== undefined && (
                <span className="flex items-center gap-1">
                  <Users className="w-3 h-3" aria-hidden="true" />
                  {memberCount} {t('about.members')}
                </span>
              )}
              {isMember && (
                <span className="flex items-center gap-1 text-primary-foreground">
                  <UserCheck className="w-3 h-3" aria-hidden="true" />
                  {t('about.member')}
                </span>
              )}
            </div>
          )}

          {/* Leads — name only (no per-lead location) */}
          {hasLeads && (
            <div className="mt-4 pt-4 border-t border-primary-foreground/15">
              <h3 className="mb-3 text-label uppercase text-primary-foreground/60">{t('about.leads')}</h3>
              {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
              {/* biome-ignore lint/a11y/useSemanticElements: role="list" restores semantics after Tailwind reset */}
              <ul role="list" className="flex flex-wrap gap-x-6 gap-y-3">
                {leads.map(lead => (
                  <li key={lead.href}>
                    <a
                      href={lead.href}
                      className="flex items-center gap-3 rounded-md p-1 -m-1 hover:bg-primary-foreground/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/50"
                    >
                      <Avatar className="w-9 h-9 border-2 border-primary-foreground/25">
                        {lead.avatarUrl && <AvatarImage src={lead.avatarUrl} alt={lead.name} />}
                        <AvatarFallback className="bg-primary-foreground/15 text-primary-foreground text-badge">
                          {lead.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-card-title text-primary-foreground truncate">{lead.name}</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      {/* Apply / Join CTA (self-contained — renders its own helper text when needed) */}
      {joinSlot && <div className="flex flex-col items-center">{joinSlot}</div>}

      {/* ── Why ── */}
      {data.why && (
        <SectionCard
          icon={<Target className="w-4 h-4 text-muted-foreground" aria-hidden="true" />}
          title={whyTitle ?? t('about.why')}
          canEdit={hasEditPrivilege}
          onEdit={onEditWhy}
          editLabel={t('about.edit')}
        >
          <MarkdownContent content={data.why} />
        </SectionCard>
      )}

      {/* ── Who ── */}
      {data.who && (
        <SectionCard
          icon={<Users className="w-4 h-4 text-muted-foreground" aria-hidden="true" />}
          title={whoTitle ?? t('about.who')}
          canEdit={hasEditPrivilege}
          onEdit={onEditWho}
          editLabel={t('about.edit')}
        >
          <MarkdownContent content={data.who} />
        </SectionCard>
      )}

      {/* ── Community guidelines (integration layer fills the slot) ── */}
      {guidelinesSlot}

      {/* ── References ── */}
      {(data.references.length > 0 || (hasEditPrivilege && onEditReferences)) && (
        <SectionCard
          title={t('about.references')}
          canEdit={hasEditPrivilege}
          onEdit={onEditReferences}
          editLabel={t('about.edit')}
        >
          <div className="space-y-3">
            {data.references.map(ref => (
              <a
                key={ref.uri}
                href={ref.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="shrink-0 flex items-center justify-center size-9 rounded-lg bg-primary/10 mt-0.5">
                  <Globe className="w-4 h-4 text-primary" aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-body-emphasis text-foreground truncate">{ref.name}</span>
                  {ref.description && (
                    <span className="block mt-0.5 line-clamp-2 text-caption text-muted-foreground">
                      {ref.description}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-1 mt-1 text-caption text-primary">
                    <ExternalLink className="w-3 h-3" aria-hidden="true" />
                    {hostnameOf(ref.uri)}
                  </span>
                </span>
              </a>
            ))}
          </div>
        </SectionCard>
      )}

      {/* ── Hosted by ── */}
      {data.provider && (
        <section className="rounded-lg border border-border bg-card p-5">
          <h2 className="mb-3 text-card-title text-foreground">{t('about.hostedBy')}</h2>
          <div className="flex items-center gap-3">
            <a
              href={data.provider.href}
              className="flex items-center gap-3 flex-1 min-w-0 rounded-md p-1 -m-1 hover:bg-muted/50 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="w-10 h-10 border-2 border-border">
                {data.provider.avatarUrl && <AvatarImage src={data.provider.avatarUrl} alt={data.provider.name} />}
                <AvatarFallback className="text-caption">{data.provider.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="min-w-0">
                <span className="block text-card-title text-foreground truncate">{data.provider.name}</span>
                {data.provider.location && (
                  <span className="flex items-center gap-1 text-caption text-muted-foreground">
                    <MapPin className="w-3 h-3" aria-hidden="true" />
                    {data.provider.location}
                  </span>
                )}
              </span>
            </a>
            {contactHostSlot && <div className="shrink-0">{contactHostSlot}</div>}
          </div>
        </section>
      )}
    </div>
  );
}

/** Strips the protocol and path, leaving the host (e.g. `https://a.com/x` → `a.com`). */
function hostnameOf(uri: string): string {
  return uri.replace(/^https?:\/\//, '').split('/')[0];
}

function EditIconButton({
  icon: Icon,
  label,
  onClick,
  className,
}: {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild={true}>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onClick}
          aria-label={label}
          className={cn('h-7 w-7 rounded-full', className)}
        >
          <Icon className="w-3.5 h-3.5" aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function SectionCard({
  icon,
  title,
  canEdit,
  onEdit,
  editLabel,
  children,
}: {
  icon?: ReactNode;
  title: string;
  canEdit?: boolean;
  onEdit?: () => void;
  editLabel: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-border bg-card p-5">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-card-title text-foreground flex items-center gap-2">
          {icon}
          {title}
        </h2>
        {canEdit && onEdit && (
          <Tooltip>
            <TooltipTrigger asChild={true}>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onEdit}
                aria-label={editLabel}
                className="h-7 w-7 shrink-0 -mr-2"
              >
                <Pencil className="w-3.5 h-3.5 text-muted-foreground" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>{editLabel}</TooltipContent>
          </Tooltip>
        )}
      </div>
      {children}
    </section>
  );
}
