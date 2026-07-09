import { useTranslation } from 'react-i18next';
import { getInitials } from '@/crd/lib/getInitials';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';

type ApplicationCardData = {
  id: string;
  spaceName: string;
  spaceHref: string;
  /** The space's cardBanner. Wide, so it is cropped to fill the square tile. */
  spaceImageUrl?: string;
  /** Deterministic accent colour, shown as the fallback when `spaceImageUrl` is
   * missing. */
  color?: string;
};

type ApplicationsBlockProps = {
  applications: ApplicationCardData[];
  className?: string;
};

/**
 * Pending applications, laid out as the rows of `InvitationsBlock` but without
 * the accept/decline actions — an application is awaiting someone else's
 * decision, so there is nothing for the applicant to act on here.
 *
 * Renders nothing when there are no applications, so the dashboard can mount it
 * unconditionally.
 */
export function ApplicationsBlock({ applications, className }: ApplicationsBlockProps) {
  const { t } = useTranslation('crd-dashboard');

  if (applications.length === 0) {
    return null;
  }

  return (
    <section className={cn('space-y-3', className)}>
      <h3 className="text-subsection-title">{t('applications.title')}</h3>

      <ul className="space-y-2">
        {applications.map(application => (
          <li key={application.id} className="rounded-lg border border-border bg-card p-4 flex items-center gap-4">
            <Avatar className="size-10 shrink-0 rounded-lg">
              {application.spaceImageUrl ? (
                <AvatarImage
                  src={application.spaceImageUrl}
                  alt={application.spaceName}
                  className="rounded-lg object-cover"
                />
              ) : null}
              <AvatarFallback
                className={cn('rounded-lg text-caption', application.color && 'text-white')}
                color={application.color}
              >
                {getInitials(application.spaceName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <a
                href={application.spaceHref}
                className="text-card-title hover:underline focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none rounded-sm"
              >
                {application.spaceName}
              </a>
            </div>

            <Badge variant="secondary" className="shrink-0">
              {t('applications.pending')}
            </Badge>
          </li>
        ))}
      </ul>
    </section>
  );
}

export type { ApplicationCardData, ApplicationsBlockProps };
