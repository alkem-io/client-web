import { ExternalLink, MapPin } from 'lucide-react';
import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
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

type SpaceAboutData = {
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
  guidelines?: string;
  references: CalloutReference[];
};

type SpaceAboutViewProps = {
  data: SpaceAboutData;
  joinAction?: ReactNode;
  className?: string;
};

export function SpaceAboutView({ data, joinAction, className }: SpaceAboutViewProps) {
  const { t } = useTranslation('crd-space');

  return (
    <div className={cn('max-w-3xl mx-auto space-y-8', className)}>
      {/* Header */}
      <div>
        <h1 className="text-page-title text-foreground">{data.name}</h1>
        {data.tagline && <p className="text-subsection-title font-normal text-muted-foreground mt-2">{data.tagline}</p>}
        {joinAction && <div className="mt-4">{joinAction}</div>}
      </div>

      {/* Description */}
      {data.description && (
        <section>
          <MarkdownContent content={data.description} />
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
              <div key={metric.name} className="text-center p-4 border border-border rounded-lg">
                <p className="text-page-title text-primary">{metric.value}</p>
                <p className="text-caption text-muted-foreground mt-1">{metric.name}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      <Separator />

      {/* Why */}
      {data.why && (
        <section>
          <h2 className="text-subsection-title text-foreground mb-3">{t('about.why')}</h2>
          <MarkdownContent content={data.why} />
        </section>
      )}

      {/* Who */}
      {data.who && (
        <section>
          <h2 className="text-subsection-title text-foreground mb-3">{t('about.who')}</h2>
          <MarkdownContent content={data.who} />
        </section>
      )}

      {/* Host / Provider */}
      {data.provider && (
        <section>
          <h2 className="text-subsection-title text-foreground mb-3">{t('about.host')}</h2>
          <LeadCard lead={data.provider} />
        </section>
      )}

      {/* Lead Users */}
      {data.leadUsers.length > 0 && (
        <section>
          <h2 className="text-subsection-title text-foreground mb-3">{t('about.leadUsers')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.leadUsers.map(lead => (
              <LeadCard key={lead.href} lead={lead} />
            ))}
          </div>
        </section>
      )}

      {/* Lead Organizations */}
      {data.leadOrganizations.length > 0 && (
        <section>
          <h2 className="text-subsection-title text-foreground mb-3">{t('about.leadOrganizations')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {data.leadOrganizations.map(lead => (
              <LeadCard key={lead.href} lead={lead} />
            ))}
          </div>
        </section>
      )}

      {/* Guidelines */}
      {data.guidelines && (
        <section>
          <h2 className="text-subsection-title text-foreground mb-3">{t('about.guidelines')}</h2>
          <MarkdownContent content={data.guidelines} />
        </section>
      )}

      {/* References */}
      {data.references.length > 0 && (
        <section>
          <h2 className="text-subsection-title text-foreground mb-3">{t('about.references')}</h2>
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
