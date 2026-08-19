import { contentColumnClass } from '@/crd/lib/contentColumn';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';

type SpaceSettingsHeaderAvatarProps =
  | {
      /**
       * Suppress the avatar entirely (renders title + tagline only). Set for L0 settings headers,
       * since L0 has no avatar concept per the canonical visual-fields rule.
       */
      hideAvatar: true;
      avatarUrl?: never;
      initials?: never;
      avatarColor?: never;
    }
  | {
      hideAvatar?: false;
      avatarUrl?: string | null;
      /** Two-letter fallback shown when `avatarUrl` is absent. */
      initials: string;
      /** Hex color used to tint the avatar fallback (from `pickColorFromId`). */
      avatarColor: string;
    };

export type SpaceSettingsHeaderProps = SpaceSettingsHeaderAvatarProps & {
  title: string;
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
 * Compact header for the Space Settings area: a title block (avatar + space
 * name + tagline) aligned to the shell's col-start-2 / col-span-10 grid.
 * The settings tab strip is NOT part of this header — consumers render
 * `SpaceSettingsTabStrip` in a sticky row below it (e.g. the `SpaceShell`
 * tabs slot) so the tabs stay pinned under the platform header on scroll.
 */
export function SpaceSettingsHeader({
  title,
  tagline,
  avatarUrl,
  initials,
  avatarColor,
  hideAvatar,
  fullWidth = false,
  className,
}: SpaceSettingsHeaderProps) {
  const innerColClass = cn('col-span-12', contentColumnClass(fullWidth));

  return (
    <div className={cn('w-full', className)}>
      <div className="w-full px-6 md:px-8 pt-8 pb-4">
        <div className="grid grid-cols-12 gap-6">
          <div className={innerColClass}>
            <div className="flex items-center gap-4">
              {!hideAvatar && (
                <Avatar className="size-12 shrink-0">
                  {avatarUrl ? <AvatarImage src={avatarUrl} alt="" /> : null}
                  <AvatarFallback className="text-white text-body-emphasis" style={{ backgroundColor: avatarColor }}>
                    {initials}
                  </AvatarFallback>
                </Avatar>
              )}
              <div className="min-w-0">
                <h1 className="text-page-title truncate">{title}</h1>
                {tagline && <p className="mt-0.5 text-body text-muted-foreground">{tagline}</p>}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
