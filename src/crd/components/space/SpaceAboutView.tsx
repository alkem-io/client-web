import { ExternalLink, Flag, MapPin, Pencil, UserCheck, Users } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Button } from '@/crd/primitives/button';
import { Separator } from '@/crd/primitives/separator';

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
  /** Apply / Join CTA rendered below the members/leads row when the viewer can join. */
  joinSlot?: ReactNode;
  /** CommunityGuidelinesBlock from the integration layer. */
  guidelinesSlot?: ReactNode;
  /** Single-line "Contact host" affordance rendered inside the host block. */
  contactHostSlot?: ReactNode;
  whyTitle?: string;
  whoTitle?: string;
  /** Members count for the top-left card (`metrics` entry whose name === 'member'). */
  memberCount?: string;
  /** True when the viewer is already a member of this community — drives the UserCheck badge. */
  isMember?: boolean;
  hasEditPrivilege?: boolean;
  onEditDescription?: () => void;
  onEditWhy?: () => void;
  onEditWho?: () => void;
  onEditReferences?: () => void;
  /** Edit pencil on the Members card — typically navigates to settings/community. */
  onEditMembers?: () => void;
};

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

  const hasLeads = data.leadUsers.length > 0 || data.leadOrganizations.length > 0;
  const leads = [...data.leadUsers, ...data.leadOrganizations];

  return (
    <div className={cn('max-w-3xl mx-auto space-y-6', className)}>
      {/* Top row: Members (left) + Leads OR Host (right) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <MembersCard
          count={memberCount}
          isMember={isMember}
          canEdit={hasEditPrivilege}
          onEdit={onEditMembers}
          membersLabel={t('about.members')}
          editLabel={t('about.editMembers')}
        />

        {hasLeads ? (
          <LeadsCard leads={leads} title={t('about.leads')} />
        ) : (
          data.provider && (
            <HostCard
              provider={data.provider}
              title={t('about.hostedBy')}
              contactHostSlot={contactHostSlot}
              compact={true}
            />
          )
        )}
      </div>

      {/* Apply / Join CTA (self-contained — the button renders its own helper text when needed) */}
      {joinSlot && <div className="flex flex-col items-center">{joinSlot}</div>}

      {/* Description — visible title is sr-only, pencil sits to the right of the
          content so it aligns with the description rather than floating in its
          own row above it (matching the Why / Who / References sections). */}
      {(data.description || (hasEditPrivilege && onEditDescription)) && (
        <section>
          <h2 className="sr-only">{t('about.title')}</h2>
          <div className="flex justify-between items-start gap-3">
            <div className="flex-1 min-w-0">{data.description && <MarkdownContent content={data.description} />}</div>
            {hasEditPrivilege && onEditDescription && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={onEditDescription}
                aria-label={t('about.edit')}
                className="-mr-2 shrink-0"
              >
                <Pencil className="w-4 h-4" aria-hidden="true" />
              </Button>
            )}
          </div>
        </section>
      )}

      {/* Location */}
      {data.location && (
        <div className="flex items-center gap-2 text-body text-muted-foreground">
          <MapPin className="w-4 h-4" aria-hidden="true" />
          {data.location}
        </div>
      )}

      <Separator />

      {/* Why */}
      {data.why && (
        <section>
          <SectionHeader
            title={whyTitle ?? t('about.why')}
            icon={<Flag className="w-5 h-5 text-primary" aria-hidden="true" />}
            canEdit={hasEditPrivilege}
            onEditClick={onEditWhy}
            editLabel={t('about.edit')}
          />
          <MarkdownContent content={data.why} />
        </section>
      )}

      {/* Who */}
      {data.who && (
        <section>
          <SectionHeader
            title={whoTitle ?? t('about.who')}
            icon={<Users className="w-5 h-5 text-primary" aria-hidden="true" />}
            canEdit={hasEditPrivilege}
            onEditClick={onEditWho}
            editLabel={t('about.edit')}
          />
          <MarkdownContent content={data.who} />
        </section>
      )}

      {/* Community Guidelines (integration layer fills the slot with CommunityGuidelinesBlock) */}
      {guidelinesSlot}

      {/* References */}
      {(data.references.length > 0 || (hasEditPrivilege && onEditReferences)) && (
        <section>
          <SectionHeader
            title={t('about.references')}
            canEdit={hasEditPrivilege}
            onEditClick={onEditReferences}
            editLabel={t('about.edit')}
          />
          <div className="space-y-2">
            {data.references.map(ref => (
              <a
                key={ref.uri}
                href={ref.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 p-3 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <ExternalLink className="w-4 h-4 text-primary shrink-0" aria-hidden="true" />
                <div>
                  <p className="text-body-emphasis text-foreground">{ref.name}</p>
                  {ref.description && <p className="text-caption text-muted-foreground">{ref.description}</p>}
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      {/* Hosted by — rendered at the bottom when leads occupy the top-right card. */}
      {hasLeads && data.provider && (
        <HostCard provider={data.provider} title={t('about.hostedBy')} contactHostSlot={contactHostSlot} />
      )}
    </div>
  );
}

function MembersCard({
  count,
  isMember,
  canEdit,
  onEdit,
  membersLabel,
  editLabel,
}: {
  count?: string;
  isMember?: boolean;
  canEdit?: boolean;
  onEdit?: () => void;
  membersLabel: string;
  editLabel: string;
}) {
  return (
    <div className="bg-primary text-primary-foreground rounded-lg p-4 flex items-center justify-between gap-3 min-h-[72px]">
      <div className="flex items-center gap-3 min-w-0">
        {count !== undefined && (
          <span
            aria-hidden="true"
            className="flex items-center justify-center size-8 rounded-full border-2 border-primary-foreground/80 text-body-emphasis"
          >
            {count}
          </span>
        )}
        <span className="text-body-emphasis truncate">{membersLabel}</span>
      </div>
      <div className="flex items-center gap-1 shrink-0">
        {isMember && <UserCheck className="w-5 h-5 opacity-80" aria-hidden="true" />}
        {canEdit && onEdit && (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onEdit}
            aria-label={editLabel}
            className="text-primary-foreground hover:bg-primary-foreground/10 hover:text-primary-foreground"
          >
            <Pencil className="w-4 h-4" aria-hidden="true" />
          </Button>
        )}
      </div>
    </div>
  );
}

function LeadsCard({ leads, title }: { leads: SpaceLeadData[]; title: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4">
      <h2 className="text-body-emphasis text-foreground mb-3">{title}</h2>
      {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
      {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
      <ul role="list" className="space-y-2">
        {leads.map(lead => (
          <li key={lead.href}>
            <a
              href={lead.href}
              className="flex items-center gap-2 rounded-md hover:bg-muted/50 transition-colors p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Avatar className="w-7 h-7 shrink-0">
                {lead.avatarUrl && <AvatarImage src={lead.avatarUrl} alt={lead.name} />}
                <AvatarFallback className="text-badge">{lead.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <span className="text-body text-foreground truncate">{lead.name}</span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function HostCard({
  provider,
  title,
  contactHostSlot,
  compact,
}: {
  provider: SpaceLeadData;
  title: string;
  contactHostSlot?: ReactNode;
  compact?: boolean;
}) {
  return (
    <section className="bg-card border border-border rounded-lg p-4">
      <h2 className="text-body-emphasis text-foreground mb-3">{title}</h2>
      <div className="flex items-center gap-3">
        <a
          href={provider.href}
          className="flex items-center gap-3 flex-1 min-w-0 rounded-md hover:bg-muted/50 transition-colors p-1 -m-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Avatar className={cn(compact ? 'w-7 h-7' : 'w-10 h-10', 'shrink-0')}>
            {provider.avatarUrl && <AvatarImage src={provider.avatarUrl} alt={provider.name} />}
            <AvatarFallback className="text-caption">{provider.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <span className="text-body-emphasis text-foreground truncate">{provider.name}</span>
        </a>
        {contactHostSlot && <div className="shrink-0">{contactHostSlot}</div>}
      </div>
    </section>
  );
}

function SectionHeader({
  title,
  icon,
  canEdit,
  onEditClick,
  editLabel,
  srOnlyTitle,
}: {
  title: string;
  icon?: ReactNode;
  canEdit?: boolean;
  onEditClick?: () => void;
  editLabel: string;
  srOnlyTitle?: boolean;
}) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className={cn('text-subsection-title text-foreground flex items-center gap-2', srOnlyTitle && 'sr-only')}>
        {icon}
        {title}
      </h2>
      {canEdit && onEditClick && (
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onEditClick}
          aria-label={editLabel}
          className="-mr-2"
        >
          <Pencil className="w-4 h-4" aria-hidden="true" />
        </Button>
      )}
    </div>
  );
}
