import { useTranslation } from 'react-i18next';
import { getInitials } from '@/crd/lib/getInitials';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';

export type OrgPendingApplicationCardData = {
  id: string;
  organizationName: string;
  organizationAvatarUrl?: string;
  organizationHref: string;
  /** Deterministic accent colour, shown as the avatar fallback when `organizationAvatarUrl` is missing. */
  color?: string;
};

export type OrgPendingApplicationCardProps = {
  application: OrgPendingApplicationCardData;
  onClick?: () => void;
  className?: string;
};

/** Personal pending-organization-application card (062) — the applicant's own view. */
export function OrgPendingApplicationCard({ application, onClick, className }: OrgPendingApplicationCardProps) {
  const { t } = useTranslation('crd-dashboard');

  return (
    <a
      href={application.organizationHref}
      onClick={e => {
        if (onClick) {
          e.preventDefault();
          onClick();
        }
      }}
      aria-label={t('pendingMemberships.applicationAriaLabel', { spaceName: application.organizationName })}
      className={cn(
        'block w-full min-h-11 rounded-lg border border-border bg-card p-4 transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
        'flex items-center gap-3',
        className
      )}
    >
      <Avatar className="size-10 shrink-0 rounded-lg">
        {application.organizationAvatarUrl ? (
          <AvatarImage
            src={application.organizationAvatarUrl}
            alt={application.organizationName}
            className="rounded-lg object-cover"
          />
        ) : null}
        <AvatarFallback
          className={cn('rounded-lg text-caption', application.color && 'text-white')}
          color={application.color}
        >
          {getInitials(application.organizationName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-card-title leading-tight truncate">{application.organizationName}</p>
          <Badge variant="secondary" className="shrink-0 text-badge">
            {t('pendingMemberships.orgAssociateCard.badge')}
          </Badge>
        </div>
        <p className="text-caption text-muted-foreground mt-0.5">
          {t('pendingMemberships.orgAssociateCard.pendingLabel')}
        </p>
      </div>
    </a>
  );
}
