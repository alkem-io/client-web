import type { ReferenceLink } from '@/crd/components/common/profileTypes';
import { excludeSocialReferences } from '@/crd/components/common/SocialLinks';

export type ReferencesListProps = {
  /** Section heading. */
  title: string;
  references: ReferenceLink[];
  /**
   * Drop social references (they render in a separate `<SocialLinks>` block).
   * Defaults to `true`. Pass `false` to render every entry as a flat list.
   */
  excludeSocial?: boolean;
};

/**
 * Renders a "Links" section: a heading plus a list of labelled URL chips.
 * Returns `null` when there are no references to show — no heading, no
 * empty-state caption.
 */
export function ReferencesList({ title, references, excludeSocial = true }: ReferencesListProps) {
  const items = excludeSocial ? excludeSocialReferences(references) : references;

  if (items.length === 0) return null;

  return (
    <section>
      <h2 className="text-section-title mb-4">{title}</h2>
      {/* biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style */}
      {/* biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset */}
      <ul role="list" className="space-y-2 list-none p-0 m-0">
        {items.map(ref => (
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
    </section>
  );
}
