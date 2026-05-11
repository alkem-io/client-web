import type { ReactNode } from 'react';
import { MarkdownContent } from '@/crd/components/common/MarkdownContent';
import type { ReferenceLink, TagsetGroup } from '@/crd/components/common/profileTypes';
import { hasSocialReferences, SocialLinks } from '@/crd/components/common/SocialLinks';
import { TruncatedTag } from '@/crd/components/common/TruncatedTag';

export type UserProfileSidebarProps = {
  bio: string | null;
  /**
   * Reserved profile tagsets — Keywords + Skills (FR-010a). Empty entries are
   * dropped by the mapper; the block is hidden entirely when the array is empty.
   */
  tagsets: TagsetGroup[];
  /**
   * Pre-rendered organisation cards. Lazy fetching per organisation lives in
   * the integration layer (each card is a `useAssociatedOrganization` consumer
   * that produces a `CompactContributorCard`). The view just renders the slot.
   */
  organizationsSlot: ReactNode | ReactNode[];
  /** True when there are no organisations to render — drives the empty-state. */
  organizationsEmpty: boolean;
  /**
   * Optional references (social + non-social). The view passes the array
   * straight to `<SocialLinks>` which filters internally for known networks
   * (website / linkedin / github / bsky / youtube / email) and renders them
   * as a monochrome icon row. When no social refs are present, the section
   * is hidden entirely.
   */
  references?: ReferenceLink[];
  labels: {
    aboutTitle: string;
    organizationsTitle: string;
    socialLinksTitle: string;
    bioEmpty: string;
    organizationsEmpty: string;
  };
};

export function UserProfileSidebar({
  bio,
  tagsets,
  organizationsSlot,
  organizationsEmpty,
  references,
  labels,
}: UserProfileSidebarProps) {
  const refs = references ?? [];

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-section-title mb-4 flex items-center gap-2">{labels.aboutTitle}</h2>
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
                {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
                {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
                <ul role="list" className="flex flex-wrap gap-2 list-none p-0 m-0">
                  {tagset.tags.map(tag => (
                    <li key={tag} className="max-w-full">
                      <TruncatedTag text={tag} />
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {hasSocialReferences(refs) ? (
        <section>
          <h2 className="text-label uppercase text-muted-foreground mb-3">{labels.socialLinksTitle}</h2>
          <SocialLinks references={refs} />
        </section>
      ) : null}

      <section>
        <h2 className="text-section-title mb-4 flex items-center gap-2">{labels.organizationsTitle}</h2>
        {organizationsEmpty ? (
          <p className="text-body text-muted-foreground">{labels.organizationsEmpty}</p>
        ) : (
          <div className="flex flex-col gap-3">{organizationsSlot}</div>
        )}
      </section>
    </div>
  );
}
