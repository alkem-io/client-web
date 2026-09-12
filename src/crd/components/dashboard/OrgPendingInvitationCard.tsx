import { useTranslation } from 'react-i18next';
import { getInitials } from '@/crd/lib/getInitials';
import { cn } from '@/crd/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/crd/primitives/avatar';
import { Badge } from '@/crd/primitives/badge';

export type OrgPendingInvitationCardData = {
  id: string;
  organizationName: string;
  organizationAvatarUrl?: string;
  offeredRoleLabel: string;
  timeElapsed: string;
  /** Deterministic accent colour, shown as the avatar fallback when `organizationAvatarUrl` is missing. */
  color?: string;
};

export type OrgPendingInvitationCardProps = {
  invitation: OrgPendingInvitationCardData;
  onClick?: () => void;
  className?: string;
};

/**
 * Personal pending-organization-invitation card (062, US2-AS4). Deliberately its own
 * component rather than a `PendingInvitationCard` variant: an organization invitation
 * has no sender space, carries an offered role instead of a welcome-message excerpt, and
 * must read as visually distinct from a Space invitation (the "Organisation" badge).
 */
export function OrgPendingInvitationCard({ invitation, onClick, className }: OrgPendingInvitationCardProps) {
  const { t } = useTranslation('crd-dashboard');

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full min-h-11 rounded-lg border border-border bg-card p-4 text-left transition-colors hover:bg-accent/50 focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none cursor-pointer',
        'flex items-center gap-3',
        className
      )}
    >
      <Avatar className="size-10 shrink-0 rounded-lg">
        {invitation.organizationAvatarUrl ? (
          <AvatarImage
            src={invitation.organizationAvatarUrl}
            alt={invitation.organizationName}
            className="rounded-lg object-cover"
          />
        ) : null}
        <AvatarFallback
          className={cn('rounded-lg text-caption', invitation.color && 'text-white')}
          color={invitation.color}
        >
          {getInitials(invitation.organizationName)}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-card-title leading-tight truncate">{invitation.organizationName}</p>
          <Badge variant="secondary" className="shrink-0 text-badge">
            {t('pendingMemberships.orgAssociateCard.badge')}
          </Badge>
        </div>
        <p className="text-caption text-muted-foreground mt-0.5 truncate">{invitation.offeredRoleLabel}</p>
      </div>

      <span className="text-caption text-muted-foreground shrink-0">{invitation.timeElapsed}</span>
    </button>
  );
}
