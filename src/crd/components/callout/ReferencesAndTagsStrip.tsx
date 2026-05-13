import { ExternalLink } from 'lucide-react';
import { cn } from '@/crd/lib/utils';
import { Badge } from '@/crd/primitives/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/crd/primitives/tooltip';

export type ReferencesAndTagsStripReference = {
  id: string;
  name: string;
  uri: string;
  description?: string;
};

type ReferencesAndTagsStripProps = {
  references?: ReferencesAndTagsStripReference[];
  tags?: string[];
  /**
   * How many tag pills to show inline before collapsing the rest into a
   * `+N` tooltip pill. Default 3 — matches MUI's `CalloutHeader` and works
   * well in both the feed-level `PostCard` and the detail dialog body.
   */
  visibleTagCount?: number;
  className?: string;
};

/**
 * Compact references + tags row used in the feed callout card AND the detail
 * dialog body — one component, two surfaces. Mirrors MUI's `CalloutHeader`:
 * each reference renders on its own line as an external-link affordance
 * (opens in a new tab); tags wrap on a separate row beneath as outlined pills
 * with a `+N` overflow that surfaces the hidden ones in a tooltip.
 */
export function ReferencesAndTagsStrip({
  references,
  tags,
  visibleTagCount = 3,
  className,
}: ReferencesAndTagsStripProps) {
  const hasReferences = (references?.length ?? 0) > 0;
  const hasTags = (tags?.length ?? 0) > 0;
  if (!hasReferences && !hasTags) return null;

  const visibleTags = tags?.slice(0, visibleTagCount) ?? [];
  const hiddenTags = tags?.slice(visibleTagCount) ?? [];

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
                <ExternalLink className="size-3.5 shrink-0" aria-hidden="true" />
                <span>{ref.name}</span>
              </a>
            </li>
          ))}
        </ul>
      )}

      {hasTags && (
        <div className="flex flex-wrap items-center gap-1.5">
          {visibleTags.map(tag => (
            <Badge
              key={tag}
              variant="outline"
              className="text-badge px-2 h-5 font-medium border-border text-foreground rounded-full"
            >
              {tag}
            </Badge>
          ))}
          {hiddenTags.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild={true}>
                <Badge
                  asChild={true}
                  variant="outline"
                  className="text-badge px-2 h-5 font-medium border-border text-muted-foreground rounded-full cursor-default focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  <button type="button">+{hiddenTags.length}</button>
                </Badge>
              </TooltipTrigger>
              <TooltipContent side="bottom">{hiddenTags.join(', ')}</TooltipContent>
            </Tooltip>
          )}
        </div>
      )}
    </div>
  );
}
