import { Globe, Link2 } from 'lucide-react';
import { useState } from 'react';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';

export type TagsetGroup = {
  name: string;
  tags: string[];
};

export type ReferenceLink = {
  id: string;
  name: string;
  uri: string;
  description: string | null;
};

export type AssociateGridItem = {
  id: string;
  displayName: string;
  avatarImageUrl: string | null;
  url: string;
};

export type AssociatesView = {
  associates: AssociateGridItem[];
  totalCount: number;
  canReadUsers: boolean;
};

export type SocialReferenceItem = {
  id: string;
  name: string;
  uri: string;
  brand: 'linkedin' | 'twitter' | 'github' | 'youtube' | 'generic';
};

export type OrganizationProfileSidebarProps = {
  bio: string | null;
  /** Tagsets are filtered per-entry — empty arrays are dropped before reaching the view. */
  tagsets: TagsetGroup[];
  /** Non-social references only. */
  references: ReferenceLink[];
  /** Social references rendered with brand icons (parity port of MUI `SocialLinks`). */
  socialReferences: SocialReferenceItem[];
  associates: AssociatesView;
  labels: {
    bioTitle: string;
    bioEmpty: string;
    referencesTitle: string;
    referencesEmpty: string;
    associatesTitle: (count: number) => string;
    associatesSignInCta: string;
    associatesShowMore: (count: number) => string;
    associatesShowLess: string;
    socialLinksTitle: string;
  };
};

const ASSOCIATE_CARDS_COUNT = 12;

const fallbackInitials = (name: string) =>
  name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map(part => part[0]?.toUpperCase() ?? '')
    .join('') || '?';

// `lucide-react` no longer ships brand icons (LinkedIn / GitHub / etc.) —
// fall back to a generic Link / Globe glyph. The brand identity is conveyed
// via `aria-label` and the link target. Brand-fidelity SVGs can be added
// later as a dedicated CRD primitive if/when product asks.
const brandIcon = (_brand: SocialReferenceItem['brand']) => {
  return _brand === 'generic' ? Globe : Link2;
};

export function OrganizationProfileSidebar({
  bio,
  tagsets,
  references,
  socialReferences,
  associates,
  labels,
}: OrganizationProfileSidebarProps) {
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-section-title mb-4">{labels.bioTitle}</h2>
        {bio ? <MarkdownContent content={bio} /> : <p className="text-body text-muted-foreground">{labels.bioEmpty}</p>}
      </section>

      {tagsets.length > 0 ? (
        <section>
          <div className="space-y-4">
            {tagsets.map(tagset => (
              <div key={tagset.name}>
                <div className="text-label uppercase text-muted-foreground mb-2">{tagset.name}</div>
                <div className="flex flex-wrap gap-2">
                  {tagset.tags.map(tag => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="text-section-title mb-4">{labels.referencesTitle}</h2>
        {references.length === 0 ? (
          <p className="text-body text-muted-foreground">{labels.referencesEmpty}</p>
        ) : (
          <ul className="space-y-2">
            {references.map(ref => (
              <li key={ref.id}>
                <a
                  href={ref.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="text-body-emphasis text-primary hover:underline"
                >
                  {ref.name}
                </a>
                {ref.description ? <p className="text-caption text-muted-foreground">{ref.description}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {socialReferences.length > 0 ? (
        <section>
          <h2 className="text-label uppercase text-muted-foreground mb-3">{labels.socialLinksTitle}</h2>
          <div className="flex items-center gap-3 flex-wrap">
            {socialReferences.map(s => {
              const Icon = brandIcon(s.brand);
              return (
                <a
                  key={s.id}
                  href={s.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={s.name}
                  title={s.name}
                >
                  <Icon className="w-5 h-5" />
                </a>
              );
            })}
          </div>
        </section>
      ) : null}

      <AssociatesSection associates={associates} labels={labels} />
    </div>
  );
}

type AssociatesSectionProps = {
  associates: AssociatesView;
  labels: OrganizationProfileSidebarProps['labels'];
};

function AssociatesSection({ associates, labels }: AssociatesSectionProps) {
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? associates.associates : associates.associates.slice(0, ASSOCIATE_CARDS_COUNT);
  const remaining = associates.associates.length - ASSOCIATE_CARDS_COUNT;

  return (
    <section>
      <h2 className="text-section-title mb-4">{labels.associatesTitle(associates.totalCount)}</h2>
      {!associates.canReadUsers ? (
        <p className="text-body text-muted-foreground">{labels.associatesSignInCta}</p>
      ) : (
        <>
          <div className={cn('grid grid-cols-3 sm:grid-cols-4 gap-3')}>
            {visible.map(a => (
              <a
                key={a.id}
                href={a.url}
                className="flex flex-col items-center text-center gap-1 group"
                aria-label={a.displayName}
              >
                <Avatar className="w-12 h-12 border border-border">
                  {a.avatarImageUrl ? <AvatarImage src={a.avatarImageUrl} alt={a.displayName} /> : null}
                  <AvatarFallback className="bg-secondary text-secondary-foreground text-badge">
                    {fallbackInitials(a.displayName)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-caption text-muted-foreground truncate w-full group-hover:text-foreground transition-colors">
                  {a.displayName}
                </span>
              </a>
            ))}
          </div>
          {remaining > 0 ? (
            <button
              type="button"
              onClick={() => setShowAll(prev => !prev)}
              className="mt-3 text-body-emphasis text-primary hover:underline"
            >
              {showAll ? labels.associatesShowLess : labels.associatesShowMore(remaining)}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
