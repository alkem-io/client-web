import type { ReactNode } from 'react';
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
  /** Optional tab strip rendered below the title block; gets a full-width bottom border. */
  tabs?: ReactNode;
  /**
   * When true, the title block and tab strip fill all 12 grid columns instead
   * of the default `lg:col-start-2 lg:col-span-10` inset, aligning with a
   * full-width `SpaceShell` body. The full-width bottom border is unaffected.
   */
  fullWidth?: boolean;
  className?: string;
};

/**
 * Compact header for the Space Settings area. Renders a title block (avatar +
 * space name + tagline) and, optionally, a tab strip below it. The tab strip's
 * bottom border spans the full viewport — the title and tabs align to the
 * shell's col-start-2 / col-span-10 grid, but the wrapping container (and its
 * bottom border) are full width. Matches the prototype's settings header.
 */
export function SpaceSettingsHeader({
  title,
  tagline,
  avatarUrl,
  initials,
  avatarColor,
  hideAvatar,
  tabs,
  fullWidth = false,
  className,
}: SpaceSettingsHeaderProps) {
  const innerColClass = cn('col-span-12', fullWidth ? 'lg:col-span-12' : 'lg:col-start-2 lg:col-span-10');

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
      {tabs && (
        <div className="w-full border-b border-border">
          <div className="w-full px-6 md:px-8">
            <div className="grid grid-cols-12 gap-6">
              <div className={innerColClass}>{tabs}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
