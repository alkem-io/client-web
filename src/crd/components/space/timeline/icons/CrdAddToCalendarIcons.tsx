import { cn } from '@/crd/lib/utils';
import GoogleSvg from './google.svg?react';
import OutlookSvg from './outlook.svg?react';

/**
 * Brand glyphs for the AddToCalendarMenu. The raw SVG sources are colocated
 * with this wrapper so the CRD layer is self-contained — no `@/domain/` import
 * required.
 *
 * Both SVGs use `fill="currentColor"` on their `<path>`, so the icon takes
 * its colour from the surrounding text. The wrapper deliberately does NOT
 * set its own `text-*` class so the parent's colour wins — inside a
 * `DropdownMenuItem` that means `text-muted-foreground` (the primitive
 * applies it to any descendant `<svg>` lacking an explicit `text-*`), which
 * matches the lucide `Download` icon used for the ICS row.
 *
 * For the ICS download trigger we use lucide's `Download` icon elsewhere — no
 * brand glyph required.
 */

type IconProps = {
  className?: string;
  'aria-hidden'?: boolean | 'true' | 'false';
};

export function GoogleCalendarIcon({ className, ...rest }: IconProps) {
  return <GoogleSvg className={cn('inline-block size-4', className)} aria-hidden={true} {...rest} />;
}

export function OutlookCalendarIcon({ className, ...rest }: IconProps) {
  return <OutlookSvg className={cn('inline-block size-4', className)} aria-hidden={true} {...rest} />;
}
