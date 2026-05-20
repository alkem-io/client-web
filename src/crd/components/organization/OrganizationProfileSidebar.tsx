import { useState } from 'react';
import { CollapsibleTagList } from '@/crd/components/common/CollapsibleTagList';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import type { ReferenceLink, TagsetGroup } from '@/crd/components/common/profileTypes';
import { excludeSocialReferences, hasSocialReferences, SocialLinks } from '@/crd/components/common/SocialLinks';
import { fallbackInitials } from '@/crd/lib/fallbackInitials';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

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

export type OrganizationProfileSidebarProps = {
  bio: string | null;
  /** Tagsets are filtered per-entry — empty arrays are dropped before reaching the view. */
  tagsets: TagsetGroup[];
  /**
   * ALL references (social + non-social). The view splits internally:
   *   • References section uses `excludeSocialReferences(references)`.
   *   • Social section passes `references` to `<SocialLinks>`, which filters
   *     and brand-resolves itself.
   */
  references: ReferenceLink[];
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

export function OrganizationProfileSidebar({
  bio,
  tagsets,
  references,
  associates,
  labels,
}: OrganizationProfileSidebarProps) {
  const nonSocialReferences = excludeSocialReferences(references);
  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-section-title mb-4">{labels.bioTitle}</h2>
        {bio ? <MarkdownContent content={bio} /> : <p className="text-body text-muted-foreground">{labels.bioEmpty}</p>}
      </section>

      {tagsets.length > 0 ? (
        <section>
          {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
          {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
          <ul role="list" className="space-y-4 list-none p-0 m-0">
            {tagsets.map(tagset => (
              <li key={tagset.key}>
                <h3 className="text-label uppercase text-muted-foreground mb-2">{tagset.name}</h3>
                <CollapsibleTagList tags={tagset.tags} />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section>
        <h2 className="text-section-title mb-4">{labels.referencesTitle}</h2>
        {nonSocialReferences.length === 0 ? (
          <p className="text-body text-muted-foreground">{labels.referencesEmpty}</p>
        ) : (
          /* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */
          /* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */
          <ul role="list" className="space-y-2">
            {nonSocialReferences.map(ref => (
              <li key={ref.id}>
                <a
                  href={ref.uri}
                  target="_blank"
                  rel="noreferrer"
                  className="text-body-emphasis text-primary hover:underline rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
                >
                  {ref.name}
                </a>
                {ref.description ? <p className="text-caption text-muted-foreground">{ref.description}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </section>

      {hasSocialReferences(references) ? (
        <section>
          <h2 className="text-label uppercase text-muted-foreground mb-3">{labels.socialLinksTitle}</h2>
          <SocialLinks references={references} />
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
          {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
          {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
          <ul role="list" className="grid grid-cols-3 sm:grid-cols-4 gap-3 list-none p-0 m-0">
            {visible.map(a => (
              <li key={a.id}>
                <a
                  href={a.url}
                  className="flex flex-col items-center text-center gap-1 group rounded-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
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
              </li>
            ))}
          </ul>
          {remaining > 0 ? (
            <button
              type="button"
              onClick={() => setShowAll(prev => !prev)}
              aria-expanded={showAll}
              className="mt-3 text-body-emphasis text-primary hover:underline rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
            >
              {showAll ? labels.associatesShowLess : labels.associatesShowMore(remaining)}
            </button>
          ) : null}
        </>
      )}
    </section>
  );
}
