import { cn } from '@/crd/lib/utils';
import GoogleSvg from '@/domain/timeline/calendar/components/icons/google.svg?react';
import OutlookSvg from '@/domain/timeline/calendar/components/icons/outlook.svg?react';

/**
 * Brand icons for the AddToCalendarMenu. The raw SVG source files live in the
 * domain layer (they predate the CRD migration). CRD components are allowed
 * to import asset files (.svg) directly — this is not a forbidden domain
 * import; the consumed module is a static asset, not domain logic.
 *
 * For the ICS download trigger we use lucide's CalendarDays elsewhere — no
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
