import { contentColumnClass } from '@/crd/lib/contentColumn';
import { cn } from '@/crd/lib/utils';

export type SpaceSettingsHeaderProps = {
  title: string;
  /**
   * When provided, the title renders as a link back to the space/subspace home
   * page — on mobile the settings pages have no breadcrumbs, so the name is
   * the way back.
   */
  titleHref?: string;
  tagline?: string | null;
  /**
   * When true, the title block fills all 12 grid columns instead of the
   * default `lg:col-start-2 lg:col-span-10` inset, aligning with a
   * full-width `SpaceShell` body.
   */
  fullWidth?: boolean;
  className?: string;
};

/**
 * Compact header for the Space Settings area: a title block (space name +
 * tagline) aligned to the shell's col-start-2 / col-span-10 grid.
 * The settings tab strip is NOT part of this header — consumers render
 * `SpaceSettingsTabStrip` in a sticky row below it (e.g. the `SpaceShell`
 * tabs slot) so the tabs stay pinned under the platform header on scroll.
 */
export function SpaceSettingsHeader({
  title,
  titleHref,
  tagline,
  fullWidth = false,
  className,
}: SpaceSettingsHeaderProps) {
  const innerColClass = cn('col-span-12', contentColumnClass(fullWidth));

  return (
    <div className={cn('w-full', className)}>
      <div className="w-full px-6 md:px-8 pt-8 pb-4">
        <div className="grid grid-cols-12 gap-6">
          <div className={innerColClass}>
            <div className="min-w-0">
              <h1 className="text-page-title truncate">
                {titleHref ? (
                  <a
                    href={titleHref}
                    className="hover:underline rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    {title}
                  </a>
                ) : (
                  title
                )}
              </h1>
              {tagline && <p className="mt-0.5 text-body text-muted-foreground">{tagline}</p>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
