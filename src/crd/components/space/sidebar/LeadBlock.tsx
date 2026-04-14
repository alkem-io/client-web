import { MapPin } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

export type LeadItem = {
  id: string;
  name: string;
  avatarUrl?: string;
  initials: string;
  location?: string;
  href?: string;
  type: 'person' | 'org';
};

type LeadBlockProps = {
  leads: LeadItem[];
  className?: string;
};

/**
 * Sidebar block listing all space leads (users + organizations).
 *
 * - Renders nothing when `leads` is empty (caller should branch on that).
 * - Single lead → shows "SPACE LEAD" (singular) heading.
 * - Multiple leads → shows "SPACE LEADS" (plural) heading, one compact row
 *   per lead (avatar + name + location). Organizations use square avatars
 *   (rounded-md) to mirror the treatment in `SpaceMembers`.
 */
export function LeadBlock({ leads, className }: LeadBlockProps) {
  const { t } = useTranslation('crd-space');

  if (leads.length === 0) return null;

  const heading = leads.length === 1 ? t('sidebar.spaceLead') : t('sidebar.spaceLeads');

  return (
    <div className={cn('bg-card border border-border rounded-lg p-4', className)}>
      <p className="uppercase tracking-wider text-[11px] font-semibold text-muted-foreground mb-3">{heading}</p>
      <ul className="space-y-3">
        {leads.map(lead => (
          <li key={lead.id}>
            <LeadRow lead={lead} />
          </li>
        ))}
      </ul>
    </div>
  );
}

function LeadRow({ lead }: { lead: LeadItem }) {
  const inner = (
    <div className="flex items-center gap-3">
      <Avatar className={cn('w-10 h-10 border-2 border-border shrink-0', lead.type === 'org' && 'rounded-md')}>
        {lead.avatarUrl && (
          <AvatarImage src={lead.avatarUrl} alt={lead.name} className={cn(lead.type === 'org' && 'rounded-md')} />
        )}
        <AvatarFallback
          style={{
            background: 'color-mix(in srgb, var(--primary) 15%, transparent)',
          }}
          className={cn('text-[10px] font-bold text-primary', lead.type === 'org' && 'rounded-md')}
        >
          {lead.initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-foreground truncate">{lead.name}</p>
        {lead.location && (
          <p className="flex items-center gap-1 text-xs text-muted-foreground">
            <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{lead.location}</span>
          </p>
        )}
      </div>
    </div>
  );

  if (lead.href) {
    return (
      <a
        href={lead.href}
        className="block rounded-md hover:bg-muted/40 -mx-2 px-2 py-1 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        {inner}
      </a>
    );
  }

  return inner;
}
