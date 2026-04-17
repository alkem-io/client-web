import { ExternalLink, Flag, MapPin, Pencil, Users } from 'lucide-react';
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
  joinSlot?: ReactNode;
  guidelinesSlot?: ReactNode;
  contactHostSlot?: ReactNode;
  whyTitle?: string;
  whoTitle?: string;
  hasEditPrivilege?: boolean;
  onEditDescription?: () => void;
  onEditWhy?: () => void;
  onEditWho?: () => void;
  onEditReferences?: () => void;
};

export function SpaceAboutView({
  data,
  className,
  joinSlot,
  guidelinesSlot,
  contactHostSlot,
  whyTitle,
  whoTitle,
  hasEditPrivilege = false,
  onEditDescription,
  onEditWhy,
  onEditWho,
  onEditReferences,
}: SpaceAboutViewProps) {
  const { t } = useTranslation('crd-space');

  const hasLeads = data.leadUsers.length > 0 || data.leadOrganizations.length > 0;

  return (
    <div className={cn('max-w-3xl mx-auto space-y-8', className)}>
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">{data.name}</h1>
        {data.tagline && <p className="text-base text-muted-foreground mt-2">{data.tagline}</p>}
        {joinSlot && <div className="mt-4">{joinSlot}</div>}
      </div>

      {/* Description */}
      {(data.description || (hasEditPrivilege && onEditDescription)) && (
        <section>
          <SectionHeader
            title={t('about.title')}
            srOnlyTitle={true}
            canEdit={hasEditPrivilege}
            onEditClick={onEditDescription}
            editLabel={t('about.edit')}
          />
          {data.description && <MarkdownContent content={data.description} />}
        </section>
      )}

      {/* Location */}
      {data.location && (
        <div className="flex items-center gap-2 text-body text-muted-foreground">
          <MapPin className="w-4 h-4" aria-hidden="true" />
          {data.location}
        </div>
      )}

      {/* Metrics */}
      {data.metrics.length > 0 && (
        <section>
          <h2 className="text-subsection-title text-foreground mb-4">{t('about.metrics')}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {data.metrics.map(metric => (
              <div
                key={metric.name}
                className="text-center p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
              >
                <p className="text-2xl font-bold text-primary">{metric.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{metric.name}</p>
              </div>
            ))}
          </div>
        </section>
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

      {/* Leads area: holds either community leads OR the host (when no leads exist) */}
      {hasLeads ? (
        <>
          {data.leadUsers.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">{t('about.leadUsers')}</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.leadUsers.map(lead => (
                  <li key={lead.href}>
                    <LeadCard lead={lead} />
                  </li>
                ))}
              </ul>
            </section>
          )}

          {data.leadOrganizations.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-foreground mb-3">{t('about.leadOrganizations')}</h2>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {data.leadOrganizations.map(lead => (
                  <li key={lead.href}>
                    <LeadCard lead={lead} />
                  </li>
                ))}
              </ul>
            </section>
          )}
        </>
      ) : (
        data.provider && (
          <section>
            <h2 className="text-lg font-semibold text-foreground mb-3">{t('about.host')}</h2>
            <LeadCard lead={data.provider} />
            {contactHostSlot && <div className="mt-3">{contactHostSlot}</div>}
          </section>
        )
      )}

      {/* Community Guidelines (injected by integration layer) */}
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

      {/* Host below references (when leads occupy the dedicated leads area above) */}
      {hasLeads && data.provider && (
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-3">{t('about.host')}</h2>
          <LeadCard lead={data.provider} />
          {contactHostSlot && <div className="mt-3">{contactHostSlot}</div>}
        </section>
      )}
    </div>
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
      <h2 className={cn('text-lg font-semibold text-foreground flex items-center gap-2', srOnlyTitle && 'sr-only')}>
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

function LeadCard({ lead }: { lead: SpaceLeadData }) {
  return (
    <a
      href={lead.href}
      className="flex items-center gap-3 p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
    >
      <Avatar className="w-10 h-10">
        {lead.avatarUrl && <AvatarImage src={lead.avatarUrl} alt={lead.name} />}
        <AvatarFallback className="text-caption">{lead.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div>
        <p className="text-body-emphasis text-foreground">{lead.name}</p>
        {lead.location && (
          <p className="flex items-center gap-1 text-caption text-muted-foreground">
            <MapPin className="w-3 h-3" aria-hidden="true" />
            {lead.location}
          </p>
        )}
      </div>
    </a>
  );
}
