import { ExternalLink, Paperclip } from 'lucide-react';
import { CollapsibleTagList } from '@/crd/components/common/CollapsibleTagList';
import { cn } from '@/crd/lib/utils';

export type ReferencesAndTagsStripReference = {
  id: string;
  name: string;
  uri: string;
  description?: string;
  isFile?: boolean;
};

type ReferencesAndTagsStripProps = {
  references?: ReferencesAndTagsStripReference[];
  tags?: string[];
  className?: string;
};

/**
 * Compact references + tags row used in the feed callout card AND the detail
 * dialog body — one component, two surfaces. Mirrors MUI's `CalloutHeader`:
 * each reference renders on its own line as an external-link affordance
 * (opens in a new tab); tags wrap on a separate row beneath, capped at two
 * rows with a `+N` overflow that surfaces the hidden ones on hover.
 */
export function ReferencesAndTagsStrip({ references, tags, className }: ReferencesAndTagsStripProps) {
  const hasReferences = (references?.length ?? 0) > 0;
  const hasTags = (tags?.length ?? 0) > 0;
  if (!hasReferences && !hasTags) return null;

  return (
    <div className={cn('space-y-2', className)}>
      {hasReferences && (
        // biome-ignore lint/a11y/noRedundantRoles: Tailwind preflight removes list-style
        // biome-ignore lint/a11y/useSemanticElements: role="list" needed to restore semantics after Tailwind reset
        <ul role="list" className="space-y-1">
          {references?.map(ref => (
            <li key={ref.id}>
              <a
                href={ref.uri}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-body-emphasis text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                title={ref.description || ref.name}
              >
                {ref.isFile ? (
                  <Paperclip className="size-3.5 shrink-0" aria-hidden="true" />
                ) : (
                  <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                )}
                <span>{ref.name}</span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {hasTags && <CollapsibleTagList tags={tags ?? []} />}
    </div>
  );
}
