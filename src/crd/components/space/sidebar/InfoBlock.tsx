import { MapPin, Pencil } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
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

type InfoBlockProps = {
  description: string;
  leads?: LeadItem[];
  onEditClick?: () => void;
  className?: string;
};

// Force the markdown surface to read as a single block of plain text on the
// blue panel: pure white, body-size everywhere (headings downgraded), tight
// margins between paragraphs/list items.
const MARKDOWN_OVERRIDES = cn(
  'text-primary-foreground',
  '[&_p]:text-primary-foreground [&_p]:text-body [&_p]:leading-[1.6] [&_p]:mb-2 [&_p:last-child]:mb-0',
  '[&_h1]:text-body [&_h1]:font-semibold [&_h1]:text-primary-foreground [&_h1]:mt-0 [&_h1]:mb-2',
  '[&_h2]:text-body [&_h2]:font-semibold [&_h2]:text-primary-foreground [&_h2]:mt-0 [&_h2]:mb-2',
  '[&_h3]:text-body [&_h3]:font-semibold [&_h3]:text-primary-foreground [&_h3]:mt-0 [&_h3]:mb-2',
  '[&_h4]:text-body [&_h4]:font-medium [&_h4]:text-primary-foreground [&_h4]:mt-0 [&_h4]:mb-1',
  '[&_li]:text-primary-foreground [&_li]:text-body [&_li]:mb-0',
  '[&_ul]:mb-0 [&_ol]:mb-0',
  '[&_strong]:text-primary-foreground',
  '[&_em]:text-primary-foreground',
  '[&_a]:text-primary-foreground [&_a]:underline'
);

export function InfoBlock({ description, leads = [], onEditClick, className }: InfoBlockProps) {
  const { t } = useTranslation('crd-space');

  if (!description && leads.length === 0) return null;

  const leadHeading = leads.length === 1 ? t('sidebar.spaceLead') : t('sidebar.spaceLeads');

  return (
    <div className={cn('group relative bg-primary text-primary-foreground rounded-lg p-5', className)}>
      {description && <MarkdownContent content={description} className={MARKDOWN_OVERRIDES} />}

      {leads.length > 0 && (
        <div className={cn('pt-3 border-t border-white/15', description && 'mt-3')}>
          <p className="uppercase text-label opacity-60 mb-2">{leadHeading}</p>
          {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
          {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
          <ul role="list" className="flex flex-col gap-3">
            {leads.map(lead => (
              <li key={lead.id}>
                <LeadRow lead={lead} />
              </li>
            ))}
          </ul>
        </div>
      )}

      {onEditClick && (
        <button
          type="button"
          onClick={onEditClick}
          aria-label={t('sidebar.editDescription')}
          className="absolute inset-0 rounded-lg cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <span className="sr-only">{t('sidebar.editDescription')}</span>
          <Pencil
            className="absolute top-3 right-3 w-4 h-4 opacity-0 group-hover:opacity-100 group-focus-visible:opacity-100 transition-opacity"
            aria-hidden="true"
          />
        </button>
      )}
    </div>
  );
}

function LeadRow({ lead }: { lead: LeadItem }) {
  const inner = (
    <div className="flex items-center gap-3">
      <Avatar className={cn('w-8 h-8 shrink-0 border-2 border-white/25', lead.type === 'org' && 'rounded-md')}>
        {lead.avatarUrl && (
          <AvatarImage src={lead.avatarUrl} alt={lead.name} className={cn(lead.type === 'org' && 'rounded-md')} />
        )}
        <AvatarFallback
          className={cn(
            'bg-white/15 text-primary-foreground text-badge font-bold',
            lead.type === 'org' && 'rounded-md'
          )}
        >
          {lead.initials}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        <p className="text-body font-semibold text-primary-foreground truncate">{lead.name}</p>
        {lead.location && (
          <p className="flex items-center gap-1 text-caption text-primary-foreground opacity-70">
            <MapPin className="w-3 h-3 shrink-0" aria-hidden="true" />
            <span className="truncate">{lead.location}</span>
          </p>
        )}
      </div>
    </div>
  );

  // Lead rows render as static markup inside the InfoBlock. The InfoBlock's
  // edit-overlay button covers the whole block, so wrapping in <a> here would
  // produce nested clickable elements (a-inside-button via overlay z-index)
  // and steal focus from the edit affordance. Static rendering is intentional.
  return inner;
}
